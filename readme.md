# Google API Middleware

A multi-tenant Node.js middleware service for managing Google Workspace user accounts through the Google Admin SDK API. Built with Express.js 5, PostgreSQL, Nginx, and Docker with a web monitoring dashboard.

## Features

- **User Email Management** — Full CRUD for Google Workspace user accounts (create, suspend, reactivate, password reset, info lookup)
- **Google Drive Quota** — Query storage usage per user
- **Multi-Tenant Architecture** — Isolated containers per tenant (FMC, FBPN) with separate service account credentials
- **Audit Logging** — Automatic request/response logging to PostgreSQL with sensitive data sanitization
- **Monitoring Dashboard** — Web interface with real-time log filtering, statistics, and detailed request inspection
- **Nginx Reverse Proxy** — Domain-based routing with Basic Auth and CORS support
- **Secure Password Generator** — Generates strong passwords excluding ambiguous characters
- **Docker Ready** — Fully containerized with Docker Compose

## Architecture

![Flow 1 Diagram](docs/img/flow-1.png)

```
middleware-google/
├── app.js                              # Express application configuration (CORS, JSON, routes)
├── server.js                           # Server entry point
├── Dockerfile                          # Node.js 24 Alpine container
├── docker-compose.yml                  # Multi-container orchestration
├── init.sql                            # PostgreSQL schema and indexes
├── .env.example                        # Environment variables template
├── nginx/
│   ├── reverse-proxy/
│   │   └── nginx.conf                  # Domain-based routing (FMC, FBPN, reports)
│   └── web-interface/
│       ├── nginx.conf                  # Static file server config
│       └── html/
│           ├── index.html              # Dashboard home page
│           ├── report.html             # API logs report page
│           └── img/favicon.png         # Favicon
└── src/
    ├── api/v1/
    │   ├── controllers/
    │   │   ├── adminController.v1.js   # User management handlers
    │   │   └── internalSystemController.js  # Health check and log handlers
    │   └── routes/
    │       ├── index.v1.js             # Route aggregator
    │       ├── userRoutes.v1.js        # User API routes
    │       └── systemRoutes.v1.js      # System and log routes
    ├── services/
    │   ├── googleAdminService.js       # Google Admin SDK integration
    │   └── googleTestService.js        # Google API connection test
    ├── models/
    │   ├── internalSystemModel.js      # Log query functions
    │   ├── logModel.js                 # Log creation model
    │   └── query/
    │       └── query.js                # SQL query definitions
    ├── middleware/
    │   └── auditLogger.js              # Request/response audit middleware
    ├── config/
    │   └── database.js                 # PostgreSQL connection pool
    └── utils/
        └── passwordGenerator.js        # Secure password generator
```

## API Endpoints

Base path: `/api/v1`

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/email-list` | List all users in the domain |
| `POST` | `/api/v1/users/email-create` | Create a new Google Workspace user |
| `POST` | `/api/v1/users/email-disable` | Suspend a user account |
| `POST` | `/api/v1/users/email-enable` | Reactivate a suspended account |
| `POST` | `/api/v1/users/email-infos` | Get user profile information |
| `POST` | `/api/v1/users/email-password-reset` | Reset user password (auto-generates if not provided) |
| `POST` | `/api/v1/users/drive-infos` | Get Google Drive storage quota (total/used/free) |

### System and Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check (database connectivity) |
| `GET` | `/api/v1/logs` | Retrieve all request logs |
| `GET` | `/api/v1/logs/tenant` | List all tenants |
| `GET` | `/api/v1/logs/tenant/:tenantId` | Filter logs by tenant |
| `GET` | `/api/v1/logs/status/:statusCode` | Filter logs by HTTP status code |
| `GET` | `/api/v1/logs/endpoint/:endpoint` | Filter logs by endpoint |
| `GET` | `/api/v1/logs/method/:httpMethod` | Filter logs by HTTP method |
| `POST` | `/api/v1/logs/daterange` | Filter logs by date range (format: DDMMYYYY) |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Workspace Admin account
- Google Cloud project with Admin SDK API enabled
- Service account credentials with domain-wide delegation

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/michaelrmartins/middleware-google.git
cd middleware-google
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
```

Required variables in `.env`:
```env
# Server
SERVER_IP_ADDRESS=0.0.0.0
SERVER_PORT=3000

# Tenant - FMC
TENANT_NAME_FMC=FMC EDU
TENANT_ID_FMC=FMC
ADMIN_EMAIL_FMC=admin@fmc-domain.com
DOMAIN_EMAIL_FMC=fmc-domain.com

# Tenant - FBPN
TENANT_NAME_FBPN=FBPN
TENANT_ID_FBPN=FBPN
ADMIN_EMAIL_FBPN=admin@fbpn-domain.com
DOMAIN_EMAIL_FBPN=fbpn-domain.com

# Database (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=middleware_logs
DB_USER=admin
DB_PASSWORD=your_password
```

3. Place Google service account credentials:
   - `google-credentials-fmc.json` — FMC tenant credentials
   - `google-credentials-fbpn.json` — FBPN tenant credentials

4. Start all services:
```bash
docker-compose up -d
```

### Accessing Services

| Service | URL |
|---------|-----|
| FMC API | `http://fmc.api-google.intranet` |
| FBPN API | `http://fbpn.api-google.intranet` |
| Monitoring Dashboard | `http://relatorios.api-google.intranet` |

All services require HTTP Basic Auth configured via `.htpasswd`.

### Local Development

```bash
npm install
npm run dev   # Development with nodemon
npm start     # Production
```

## API Usage Examples

### List All Users
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-list
```

### Create New User
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@domain.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "TempPass123!",
    "orgUnitPath": "/",
    "changePasswordAtNextLogin": true
  }'
```

### Suspend User Account
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-disable \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'
```

### Reactivate User Account
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-enable \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'
```

### Get User Information
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-infos \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'
```

### Reset User Password
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/email-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'
```

### Get Drive Storage Quota
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/users/drive-infos \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'
```

### Health Check
```bash
curl -u admin:password http://fmc.api-google.intranet/api/v1/health
```

### Query Logs by Date Range
```bash
curl -u admin:password -X POST http://fmc.api-google.intranet/api/v1/logs/daterange \
  -H "Content-Type: application/json" \
  -d '{"startDate": "01012025", "endDate": "31012025"}'
```

## Infrastructure

### Docker Compose Services

| Service | Image | Description |
|---------|-------|-------------|
| `middleware-fmc` | Custom (Dockerfile) | FMC tenant API on port 3000 |
| `middleware-fbpn` | Custom (Dockerfile) | FBPN tenant API on port 3000 |
| `postgres` | postgres:15-alpine | PostgreSQL database with persistent volume |
| `nginx` | nginx:alpine | Reverse proxy with Basic Auth |
| `web-interface` | nginx:alpine | Static monitoring dashboard |

All services run on a shared Docker bridge network (`intranet-network`).

### Nginx Reverse Proxy

Routes requests by domain:
- `fmc.api-google.intranet` → middleware-fmc:3000
- `fbpn.api-google.intranet` → middleware-fbpn:3000
- `relatorios.api-google.intranet` → web-interface:80

Includes proxy headers (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) and CORS preflight handling.

### Database Schema

Table `request_logs`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `tenant_id` | VARCHAR(50) | Tenant identifier (FMC/FBPN) |
| `endpoint` | VARCHAR(100) | API endpoint path |
| `http_method` | VARCHAR(10) | HTTP method |
| `status_code` | INTEGER | HTTP response status |
| `request_payload` | JSONB | Sanitized request body |
| `response_body` | JSONB | Response data |
| `ip_address` | VARCHAR(45) | Client IP |
| `duration_ms` | INTEGER | Request duration in ms |
| `created_at` | TIMESTAMP | Auto-generated timestamp |

Indexes: `tenant_id`, `created_at`, `status_code`.

## Audit Middleware

The `auditLogger` middleware automatically logs all user management requests with:

- Request/response payload capture (max 10KB, truncated with preview)
- Sensitive data sanitization (tokens, passwords, API keys, CPF, CNPJ, credit card numbers)
- Request duration tracking in milliseconds
- Client IP detection with `X-Forwarded-For` support
- Max recursion depth of 10 for nested object sanitization
- Ignored routes: `/health`, `/ping`, `/metrics`, `/favicon.ico`

## Web Monitoring Dashboard

The monitoring dashboard at `relatorios.api-google.intranet` provides:

- **Home page** — System status indicator with health check
- **Reports page** — Interactive log viewer with:
  - Filters by tenant, HTTP status, HTTP method, and date range
  - Statistics cards (total requests, successes, errors, average duration)
  - Color-coded badges for methods and status codes
  - Duration indicators (green <500ms, yellow <2s, red >2s)
  - Expandable detail modal with JSON syntax highlighting

## Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable the **Admin SDK API**
4. Create a service account with domain-wide delegation
5. Download the JSON key file
6. In Google Workspace Admin Console, authorize the service account with these scopes:
   - `https://www.googleapis.com/auth/admin.directory.user`
   - `https://www.googleapis.com/auth/admin.directory.user.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/admin.reports.usage.readonly`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 24 Alpine |
| Framework | Express.js 5.1 |
| Database | PostgreSQL 15 Alpine |
| Google API | googleapis 154.x |
| DB Driver | pg 8.x |
| Reverse Proxy | Nginx Alpine |
| Containerization | Docker / Docker Compose |
| Dev Server | Nodemon |

---

Made with care by Mike for Google Workspace automation
