// src/middlewares/auditLogger.js
const logModel = require('../models/logModel');

// ==================== CONFIGURAÇÕES ====================
const CONFIG = {
    MAX_LOG_SIZE_BYTES: 10 * 1024, // 10KB
    MAX_RECURSION_DEPTH: 10,
    PREVIEW_LENGTH: 200,
    SENSITIVE_KEYS: [
        'token', 'authorization',
        'cpf', 'cnpj', 'credit_card', 'cvv', 'card_number',
        'api_key', 'apikey', 'private_key'
    ],
    IGNORED_ROUTES: ['/health', '/ping', '/metrics', '/favicon.ico']
};

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Remove recursivamente campos sensíveis do objeto
 */
const redactSensitive = (obj, depth = 0) => {
    if (depth > CONFIG.MAX_RECURSION_DEPTH) return '[MAX_DEPTH_EXCEEDED]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => redactSensitive(item, depth + 1));
    }
    
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            const keyLower = key.toLowerCase();
            if (CONFIG.SENSITIVE_KEYS.some(s => keyLower.includes(s))) {
                return [key, '[REDACTED]'];
            }
            return [key, redactSensitive(value, depth + 1)];
        })
    );
};

/**
 * Sanitiza payload: remove dados sensíveis e trunca se necessário
 */
const sanitizePayload = (payload) => {
    if (payload === null || payload === undefined) return null;
    
    try {
        const redacted = redactSensitive(payload);
        const stringified = JSON.stringify(redacted);
        const sizeBytes = Buffer.byteLength(stringified);
        
        if (sizeBytes <= CONFIG.MAX_LOG_SIZE_BYTES) {
            return redacted;
        }
        
        return {
            _truncated: true,
            _original_size_bytes: sizeBytes,
            _preview: stringified.substring(0, CONFIG.PREVIEW_LENGTH) + '...'
        };
    } catch (e) {
        return { 
            _error: 'SERIALIZATION_FAILED', 
            _message: e.message 
        };
    }
};

/**
 * Processa o conteúdo da resposta para um formato logável
 */
const processResponseContent = (content) => {
    if (content === null || content === undefined) return null;
    
    if (Buffer.isBuffer(content)) {
        return { _type: 'Buffer', _size: content.length };
    }
    
    if (typeof content === 'string') {
        try {
            return JSON.parse(content);
        } catch {
            return { 
                _type: 'string', 
                _preview: content.substring(0, CONFIG.PREVIEW_LENGTH) 
            };
        }
    }
    
    return content;
};

// ==================== MIDDLEWARE ====================

const auditLogger = (req, res, next) => {
    // Ignora rotas configuradas
    if (CONFIG.IGNORED_ROUTES.some(route => req.originalUrl.startsWith(route))) {
        return next();
    }
    
    const startTime = Date.now();
    let responseBody = null;
    
    // Guarda referências originais com bind
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    // Intercepta res.json
    res.json = (body) => {
        responseBody = body;
        return originalJson(body);
    };
    
    // Intercepta res.send
    res.send = (content) => {
        if (responseBody === null) {
            responseBody = processResponseContent(content);
        }
        return originalSend(content);
    };
    
    // Grava log quando a resposta terminar
    res.on('finish', () => {
        const logData = {
            tenant_id: process.env.TENANT_ID || 'unknown',
            endpoint: req.originalUrl,
            http_method: req.method,
            status_code: res.statusCode,
            request_payload: sanitizePayload(req.body),
            response_body: sanitizePayload(responseBody),
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
            duration_ms: Date.now() - startTime,
            user_agent: req.headers['user-agent'] || null,
            timestamp: new Date().toISOString()
        };
        
        logModel.create(logData).catch(err => {
            console.error('[AuditLogger] Falha ao gravar:', err.message, {
                endpoint: logData.endpoint,
                method: logData.http_method
            });
        });
    });
    
    next();
};

module.exports = auditLogger;