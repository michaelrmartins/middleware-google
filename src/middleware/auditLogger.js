// src/middlewares/auditLogger.js
const logModel = require('../models/logModel');

const auditLogger = (req, res, next) => {

    console.log('Audit Logger Middleware Invoked');
    console.log('Received data: req.body=', req.body);
    console.log('Received data: res.body=', res.body);
    
    const start = Date.now();
    
    const tenantId = process.env.TENANT_ID || req.headers['x-tenant-id'] || 'unknown'; // Ajuste conforme sua lógica
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const oldJson = res.json;

    res.json = function (body) {
        res.locals.responseBody = body;
        return oldJson.call(this, body);
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        
        logModel.create({
            tenant_id: tenantId,
            endpoint: req.originalUrl,
            http_method: req.method,
            status_code: statusCode,
            request_payload: req.body, 
            response_body: res.locals.responseBody, 
            ip_address: clientIp,
            duration_ms: duration
        });
    });

    // Call controller
    next();
};

module.exports = auditLogger;