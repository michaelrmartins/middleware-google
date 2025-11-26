# Deployment Guide

## Table of Contents
- [Deployment Options](#deployment-options)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Security Hardening](#security-hardening)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Maintenance](#maintenance)

---

## Deployment Options

### 1. Docker (Recommended)
- **Pros**: Easy deployment, consistent environment, scalable
- **Cons**: Requires Docker knowledge
- **Best for**: Small to medium deployments

### 2. Cloud Platforms
- **Google Cloud Run**: Serverless, auto-scaling
- **AWS ECS**: Container orchestration
- **Azure Container Instances**: Managed containers
- **Heroku**: Simple PaaS deployment

### 3. Kubernetes
- **Pros**: Highly scalable, production-grade
- **Cons**: Complex setup
- **Best for**: Large-scale enterprise deployments

### 4. Traditional VPS
- **Pros**: Full control
- **Cons**: Manual configuration required
- **Best for**: Custom infrastructure needs

---

## Pre-Deployment Checklist

### Security

- [ ] Service account credentials secured
- [ ] Environment variables properly configured
- [ ] Secrets management solution in place
- [ ] HTTPS/TLS enabled
- [ ] API authentication implemented
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS configured properly
- [ ] Security headers added
- [ ] Dependencies audited for vulnerabilities

### Performance

- [ ] Production-grade logging configured
- [ ] Monitoring and alerting set up
- [ ] Error tracking implemented
- [ ] Health check endpoint tested
- [ ] Load testing performed
- [ ] Database connections optimized (if applicable)
- [ ] Caching strategy implemented (if applicable)

### Code Quality

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation up to date
- [ ] No debug code or console.logs (sensitive data)
- [ ] Error handling comprehensive
- [ ] No hardcoded credentials

### Infrastructure

- [ ] Domain name configured
- [ ] DNS records set up
- [ ] SSL/TLS certificate obtained
- [ ] Firewall rules configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan documented

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file (or use secrets management):

```bash
# Server Configuration
NODE_ENV=production
SERVER_IP_ADDRESS=0.0.0.0
SERVER_PORT=3000

# Google Workspace Configuration
ADMIN_EMAIL=admin@yourdomain.com
DOMAIN_EMAIL=yourdomain.com

# Logging (if using external service)
LOG_LEVEL=info
LOG_SERVICE_URL=https://logs.example.com

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn
APM_SERVICE_NAME=middleware-google
APM_SERVER_URL=https://apm.example.com
```

### Secrets Management

#### Option 1: Docker Secrets (Docker Swarm)

```bash
# Create secrets
echo "admin@domain.com" | docker secret create admin_email -
cat google-credentials.json | docker secret create google_creds -

# Use in docker-compose.yml
version: '3.8'
services:
  middleware:
    image: middleware-google:latest
    secrets:
      - admin_email
      - google_creds
    environment:
      ADMIN_EMAIL_FILE: /run/secrets/admin_email

secrets:
  admin_email:
    external: true
  google_creds:
    external: true
```

#### Option 2: Cloud Provider Secrets

**Google Cloud Secret Manager:**
```bash
# Store secret
gcloud secrets create google-credentials \
  --data-file=google-credentials.json

# Grant access to service account
gcloud secrets add-iam-policy-binding google-credentials \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

**AWS Secrets Manager:**
```bash
# Create secret
aws secretsmanager create-secret \
  --name middleware-google/credentials \
  --secret-string file://google-credentials.json
```

#### Option 3: Environment Variable Encryption

```bash
# Using SOPS (Secrets OPerationS)
sops -e .env.production > .env.production.enc

# Decrypt at runtime
sops -d .env.production.enc > .env
```

---

## Docker Deployment

### Production Dockerfile

Create `Dockerfile.production`:

```dockerfile
# Use specific version for production
FROM node:24-alpine AS base

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

### Production Docker Compose

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  middleware-google:
    build:
      context: .
      dockerfile: Dockerfile.production
    image: middleware-google:${VERSION:-latest}
    container_name: middleware-google-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      SERVER_IP_ADDRESS: 0.0.0.0
      SERVER_PORT: 3000
    env_file:
      - .env.production
    volumes:
      # Mount credentials as read-only
      - ./google-credentials.json:/app/google-credentials.json:ro
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: middleware-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - middleware-google
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream middleware {
        server middleware-google:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name api.yourdomain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Logging
        access_log /var/log/nginx/middleware-access.log;
        error_log /var/log/nginx/middleware-error.log;

        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;

        location / {
            proxy_pass http://middleware;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check endpoint (no rate limit)
        location /health {
            limit_req off;
            proxy_pass http://middleware;
        }
    }
}
```

### Deploy with Docker

```bash
# Build production image
docker build -f Dockerfile.production -t middleware-google:v1.0.0 .

# Tag as latest
docker tag middleware-google:v1.0.0 middleware-google:latest

# Start production stack
docker compose -f docker-compose.production.yml up -d

# Verify deployment
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f

# Test endpoint
curl https://api.yourdomain.com/
```

---

## Cloud Platform Deployment

### Google Cloud Run

#### 1. Prepare Application

Add `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/middleware-google:$COMMIT_SHA', '-f', 'Dockerfile.production', '.']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/middleware-google:$COMMIT_SHA']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'middleware-google'
      - '--image=gcr.io/$PROJECT_ID/middleware-google:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--set-env-vars=NODE_ENV=production'
      - '--set-secrets=ADMIN_EMAIL=admin-email:latest,GOOGLE_CREDENTIALS=google-credentials:latest'

images:
  - 'gcr.io/$PROJECT_ID/middleware-google:$COMMIT_SHA'
```

#### 2. Deploy

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create secrets
echo "admin@domain.com" | gcloud secrets create admin-email --data-file=-
gcloud secrets create google-credentials --data-file=google-credentials.json

# Deploy
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly
gcloud run deploy middleware-google \
  --image gcr.io/YOUR_PROJECT_ID/middleware-google:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets ADMIN_EMAIL=admin-email:latest,GOOGLE_CREDENTIALS=google-credentials:latest

# Get service URL
gcloud run services describe middleware-google --region us-central1 --format 'value(status.url)'
```

### AWS ECS (Elastic Container Service)

#### 1. Create ECR Repository

```bash
# Create repository
aws ecr create-repository --repository-name middleware-google

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -f Dockerfile.production -t middleware-google:latest .
docker tag middleware-google:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/middleware-google:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/middleware-google:latest
```

#### 2. Create Task Definition

`task-definition.json`:

```json
{
  "family": "middleware-google",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "middleware-google",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/middleware-google:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "ADMIN_EMAIL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:admin-email"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/middleware-google",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 3. Deploy

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster your-cluster \
  --service-name middleware-google \
  --task-definition middleware-google \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Heroku

```bash
# Login
heroku login

# Create app
heroku create middleware-google

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set ADMIN_EMAIL=admin@domain.com
heroku config:set DOMAIN_EMAIL=domain.com

# Deploy
git push heroku master

# Scale
heroku ps:scale web=2

# View logs
heroku logs --tail
```

---

## Kubernetes Deployment

### Deployment Configuration

`k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: middleware-google
  labels:
    app: middleware-google
spec:
  replicas: 3
  selector:
    matchLabels:
      app: middleware-google
  template:
    metadata:
      labels:
        app: middleware-google
    spec:
      containers:
      - name: middleware-google
        image: gcr.io/PROJECT_ID/middleware-google:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: SERVER_PORT
          value: "3000"
        - name: ADMIN_EMAIL
          valueFrom:
            secretKeyRef:
              name: middleware-secrets
              key: admin-email
        - name: DOMAIN_EMAIL
          valueFrom:
            configMapKeyRef:
              name: middleware-config
              key: domain-email
        volumeMounts:
        - name: google-credentials
          mountPath: /app/google-credentials.json
          subPath: google-credentials.json
          readOnly: true
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: google-credentials
        secret:
          secretName: google-credentials
          items:
          - key: credentials.json
            path: google-credentials.json
---
apiVersion: v1
kind: Service
metadata:
  name: middleware-google
spec:
  selector:
    app: middleware-google
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: middleware-config
data:
  domain-email: "yourdomain.com"
---
apiVersion: v1
kind: Secret
metadata:
  name: middleware-secrets
type: Opaque
stringData:
  admin-email: "admin@yourdomain.com"
---
apiVersion: v1
kind: Secret
metadata:
  name: google-credentials
type: Opaque
data:
  credentials.json: <base64-encoded-json>
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace middleware

# Create secrets
kubectl create secret generic google-credentials \
  --from-file=credentials.json=google-credentials.json \
  -n middleware

kubectl create secret generic middleware-secrets \
  --from-literal=admin-email=admin@domain.com \
  -n middleware

# Apply configuration
kubectl apply -f k8s/deployment.yaml -n middleware

# Check status
kubectl get pods -n middleware
kubectl get services -n middleware

# View logs
kubectl logs -f deployment/middleware-google -n middleware

# Scale
kubectl scale deployment middleware-google --replicas=5 -n middleware
```

### Ingress Configuration

`k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: middleware-google
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: middleware-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: middleware-google
            port:
              number: 80
```

---

## Security Hardening

### 1. Add Authentication Middleware

`src/middleware/auth.js`:

```javascript
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
}

module.exports = { apiKeyAuth };
```

**Use in app.js:**

```javascript
const { apiKeyAuth } = require('./src/middleware/auth');

// Protect all API routes
app.use('/api', apiKeyAuth);
```

### 2. Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
```

### 3. Add Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

app.use(helmet());
```

### 4. Add CORS Configuration

```bash
npm install cors
```

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
```

---

## Monitoring and Logging

### Structured Logging with Winston

```bash
npm install winston
```

`src/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

**Use in code:**

```javascript
const logger = require('../utils/logger');

logger.info('User created', { email: user.email, userId: user.id });
logger.error('Error creating user', { error: error.message, stack: error.stack });
```

### Health Check Endpoint

`src/api/v1/routes/health.js`:

```javascript
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  };

  // Check Google API connectivity (optional)
  try {
    await googleAdminService.testConnection();
    health.googleApi = 'connected';
  } catch (error) {
    health.googleApi = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

---

## Backup and Recovery

### Backup Strategy

1. **Application Code**: Version controlled in Git
2. **Configuration**: Stored in secrets manager
3. **Logs**: Retained for 30 days minimum
4. **Audit Trail**: User operations logged

### Disaster Recovery Plan

#### RTO (Recovery Time Objective): 1 hour
#### RPO (Recovery Point Objective): 15 minutes

**Recovery Steps:**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/middleware-google.git

# 2. Restore secrets from backup
# (from secrets manager or secure backup)

# 3. Deploy
docker compose -f docker-compose.production.yml up -d

# 4. Verify
curl https://api.yourdomain.com/health
```

---

## Maintenance

### Update Procedure

```bash
# 1. Pull latest code
git pull origin master

# 2. Review changes
git log --oneline -10

# 3. Update dependencies
npm update
npm audit fix

# 4. Test locally
npm run dev

# 5. Build new image
docker build -f Dockerfile.production -t middleware-google:v1.1.0 .

# 6. Deploy with zero downtime
docker compose -f docker-compose.production.yml up -d --no-deps --build middleware-google

# 7. Verify
curl https://api.yourdomain.com/health
docker compose -f docker-compose.production.yml logs -f
```

### Rolling Updates (Kubernetes)

```bash
# Update image
kubectl set image deployment/middleware-google \
  middleware-google=gcr.io/PROJECT_ID/middleware-google:v1.1.0 \
  -n middleware

# Watch rollout
kubectl rollout status deployment/middleware-google -n middleware

# Rollback if needed
kubectl rollout undo deployment/middleware-google -n middleware
```

---

## Conclusion

This deployment guide covers multiple deployment strategies. Choose the approach that best fits your infrastructure and scale requirements.

**Recommended for:**
- **Small projects**: Docker Compose
- **Medium projects**: Google Cloud Run / AWS ECS
- **Large projects**: Kubernetes

---

**Document Version:** 1.0.0
**Last Updated:** November 26, 2025
