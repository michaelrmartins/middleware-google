# Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Design Patterns](#design-patterns)
- [Dependencies](#dependencies)

---

## Overview

The Google Workspace Middleware is a **three-layer architecture** RESTful API service designed to interface between client applications and Google's Admin SDK API. It follows the principles of separation of concerns, modularity, and maintainability.

### Architecture Goals
- **Simplicity**: Easy to understand and maintain
- **Modularity**: Clear separation between layers
- **Scalability**: Ready for horizontal scaling
- **Security**: Secure credential management
- **Reliability**: Robust error handling and logging
- **Maintainability**: Clean code with single responsibility principle

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│          (Web Apps, Mobile Apps, Internal Services)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS (REST API)
                       │ JSON Requests/Responses
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Application                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    Routes Layer                         │ │
│ │              (API Endpoint Definitions)                 │ │
│ └────────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│ ┌────────────────────▼────────────────────────────────────┐ │
│ │                 Controllers Layer                       │ │
│ │         (Request/Response Handling & Validation)        │ │
│ └────────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│ ┌────────────────────▼────────────────────────────────────┐ │
│ │                  Services Layer                         │ │
│ │          (Business Logic & Google API Calls)            │ │
│ └────────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│ ┌────────────────────▼────────────────────────────────────┐ │
│ │                   Utils Layer                           │ │
│ │            (Helper Functions & Utilities)               │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Google Auth (Service Account)
                       │ OAuth 2.0 with Domain-Wide Delegation
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Cloud Platform                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Google Admin SDK API                       │ │
│ │           (Directory API - User Management)             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Google People API                          │ │
│ │              (Authentication Testing)                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Workspace Domain                      │
│                    (User Accounts & Data)                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │──1──▶│  Routes  │──2──▶│Controller│──3──▶│ Service  │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     ▲                                     │                │
     │                                     │                │
     │                                     │                ▼
     │                                     │           ┌──────────┐
     │                                     │           │  Utils   │
     │                                     │           └──────────┘
     │                                     │                │
     │                                     │                │
     │                                     ▼                ▼
     │                                ┌─────────────────────────┐
     └────────────────────────────────│   Google Admin SDK API  │
                                      └─────────────────────────┘

Flow Steps:
1. Client sends HTTP request to route endpoint
2. Route forwards to appropriate controller function
3. Controller validates request and calls service layer
4. Service uses utils (if needed) and makes Google API calls
5. Response flows back through layers to client
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 24.x | JavaScript runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **Google APIs** | 154.1.0 | Google API client library |
| **dotenv** | 17.2.1 | Environment variable management |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **nodemon** | 3.1.10 | Auto-restart during development |
| **Docker** | Latest | Containerization |
| **Docker Compose** | Latest | Multi-container orchestration |

### Runtime Environment

- **Base Image**: `node:24-alpine` (lightweight Linux distribution)
- **Package Manager**: npm
- **Module System**: CommonJS (require/module.exports)

---

## Project Structure

### Directory Tree

```
middleware-google/
├── app.js                              # Express application configuration
├── server.js                           # Server entry point & initialization
├── package.json                        # Dependencies & scripts
├── package-lock.json                   # Locked dependency versions
├── .env.example                        # Environment variable template
├── .env                                # Environment variables (not in git)
├── .dockerignore                       # Docker ignore patterns
├── .gitignore                          # Git ignore patterns
├── Dockerfile                          # Docker image definition
├── docker-compose.yml                  # Docker Compose configuration
├── google-credentials.json             # Service account key (not in git)
├── readme.md                           # Project README
│
├── docs/                               # Documentation
│   ├── API_DOCUMENTATION.md            # Complete API reference
│   ├── ARCHITECTURE.md                 # This file
│   ├── SETUP_GUIDE.md                  # Setup instructions
│   ├── DEVELOPMENT_GUIDE.md            # Development guide
│   ├── DEPLOYMENT_GUIDE.md             # Deployment guide
│   └── TROUBLESHOOTING.md              # Common issues & solutions
│
└── src/                                # Source code
    ├── api/                            # API layer
    │   └── v1/                         # API version 1
    │       ├── routes/                 # Route definitions
    │       │   ├── index.v1.js         # Main route aggregator
    │       │   ├── userRoutes.v1.js    # User management routes
    │       │   └── googleTestRoutes.v1.js  # Testing routes
    │       │
    │       └── controllers/            # Request handlers
    │           ├── adminController.v1.js    # User admin operations
    │           └── googleTestController.v1.js  # Auth testing
    │
    ├── services/                       # Business logic layer
    │   ├── googleAdminService.js       # Google Admin SDK operations
    │   └── googleTestService.js        # Google API testing
    │
    └── utils/                          # Utility functions
        └── passwordGenerator.js        # Secure password generation
```

### File Responsibilities

#### Root Level Files

**app.js**
- Purpose: Express application setup and configuration
- Responsibilities:
  - Initialize Express app
  - Configure middleware (JSON parsing)
  - Mount routes
  - Export app for server.js
- Lines of Code: ~20

**server.js**
- Purpose: Server initialization and startup
- Responsibilities:
  - Load environment variables
  - Import configured app
  - Start HTTP server
  - Define port and host
- Lines of Code: ~14

#### Routes Layer (`src/api/v1/routes/`)

**index.v1.js**
- Purpose: Aggregate all routes for API v1
- Responsibilities:
  - Import individual route modules
  - Mount routes on appropriate paths
  - Define root endpoint
- Routes:
  - `GET /` → Home message
  - `/api/v1/users/*` → User routes
  - `/api/v1/test/*` → Test routes
- Lines of Code: ~15

**userRoutes.v1.js**
- Purpose: Define user management endpoints
- Responsibilities:
  - Map HTTP methods to controller functions
  - Define user-related paths
- Endpoints: 6
- Lines of Code: ~14

**googleTestRoutes.v1.js**
- Purpose: Define testing endpoints
- Responsibilities:
  - Map testing routes
  - Verify authentication
- Endpoints: 1
- Lines of Code: ~9

#### Controllers Layer (`src/api/v1/controllers/`)

**adminController.v1.js**
- Purpose: Handle user management HTTP requests
- Responsibilities:
  - Extract request parameters
  - Call service layer functions
  - Format HTTP responses
  - Handle errors with proper status codes
- Functions: 6
  - `listAllUsersController()`
  - `createNewUserController()`
  - `suspendUserController()`
  - `reactivateUserController()`
  - `getUserInfosController()`
  - `resetUserPasswordController()`
- Lines of Code: ~96

**googleTestController.v1.js**
- Purpose: Handle authentication testing requests
- Responsibilities:
  - Test Google API authentication
  - Return service account profile
  - Handle authentication errors
- Functions: 1
  - `whoamiController()`
- Lines of Code: ~19

#### Services Layer (`src/services/`)

**googleAdminService.js**
- Purpose: Business logic for Google Admin SDK operations
- Responsibilities:
  - Authenticate with Google APIs
  - Implement user CRUD operations
  - Handle Google API errors
  - Manage domain-wide delegation
- Functions: 7
  - `listAllUsers(domain)`
  - `createUser(userData)`
  - `suspendUser(userEmail)`
  - `reactivateUser(userEmail)`
  - `getUserInfos(userEmail)`
  - `resetUserPassword(resetData)`
  - `testConnection()`
- Helper Functions:
  - `handleGoogleAPIError(error, operation)`
- Lines of Code: ~286

**googleTestService.js**
- Purpose: Test Google API authentication
- Responsibilities:
  - Simple auth verification
  - Service account profile retrieval
- Functions: 1
  - `getOwnProfile()`
- Lines of Code: ~37

#### Utils Layer (`src/utils/`)

**passwordGenerator.js**
- Purpose: Generate secure random passwords
- Responsibilities:
  - Create strong passwords
  - Ensure character diversity
  - Use cryptographically random values
- Functions: 1
  - `generatePassword(length)`
- Algorithm: Fisher-Yates shuffle
- Lines of Code: ~45

---

## Component Design

### Layered Architecture

#### 1. Routes Layer
```javascript
// Responsibility: Define API endpoints and HTTP methods
// Input: HTTP Request
// Output: Delegate to Controller
// Dependencies: Express Router, Controllers

router.post('/email-create', adminController.createNewUserController)
```

**Design Principles:**
- Thin layer, no business logic
- RESTful endpoint naming
- Proper HTTP method selection
- Version-based routing (`/api/v1/`)

---

#### 2. Controllers Layer
```javascript
// Responsibility: Handle HTTP request/response cycle
// Input: Express req, res objects
// Output: HTTP response with proper status codes
// Dependencies: Services, Express

async function createNewUserController(req, res) {
    try {
        const { primaryEmail, password, ... } = req.body;
        const newUser = await googleAdminService.createUser({...});
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ message: 'Error', error: error.errors });
    }
}
```

**Design Principles:**
- Extract request parameters
- Validate input (basic)
- Delegate to service layer
- Format responses consistently
- Handle errors with appropriate HTTP status codes
- Log errors for debugging

**Error Handling Strategy:**
- Try-catch blocks for all async operations
- Log errors to console
- Return structured error responses
- Map service errors to HTTP status codes

---

#### 3. Services Layer
```javascript
// Responsibility: Business logic and Google API interaction
// Input: Business objects (userData, userEmail)
// Output: Google API responses or processed data
// Dependencies: Google APIs, Utils

async function createUser(userData) {
    const { primaryEmail, password, ... } = userData;

    // Validation
    if (!primaryEmail || !password || ...) {
        throw new Error('Missing required fields');
    }

    // Google API call
    const response = await admin.users.insert({
        requestBody: { primaryEmail, password, ... }
    });

    return response.data;
}
```

**Design Principles:**
- Pure business logic
- Input validation
- Google API abstraction
- Detailed error handling
- No HTTP concerns
- Reusable functions

**Google API Integration:**
```javascript
// Authentication setup
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    clientOptions: {
        subject: ADMIN_EMAIL_TO_IMPERSONATE,
        timeout: 30000,
    },
});

// API instance creation
const admin = google.admin({
    version: 'directory_v1',
    auth,
    timeout: 30000,
    retry: true,
});
```

**Error Handling:**
```javascript
function handleGoogleAPIError(error, operation) {
    console.error(`Operation Error ${operation}:`, {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.response?.data
    });

    // Map Google API errors to user-friendly messages
    if (error.code === 403) {
        throw new Error(`Permission denied for ${operation}`);
    } else if (error.code === 404) {
        throw new Error(`Resource not found`);
    }

    throw error;
}
```

---

#### 4. Utils Layer
```javascript
// Responsibility: Reusable helper functions
// Input: Function-specific parameters
// Output: Processed data or generated values
// Dependencies: None (pure functions)

function generatePassword(length = 12) {
    // Character sets
    const lowerCaseChars = 'abcdefghjkmrstuvwxy';
    const upperCaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numberChars = '23456789';
    const specialChars = '*#@$%&?';

    // Ensure at least one from each category
    let passwordChars = [
        lowerCaseChars[random],
        upperCaseChars[random],
        numberChars[random],
        specialChars[random]
    ];

    // Fill remaining length
    // Shuffle using Fisher-Yates

    return passwordChars.join('');
}
```

**Design Principles:**
- Pure functions (no side effects)
- Self-contained
- Well-documented
- Testable
- Reusable across services

---

## Data Flow

### Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Request                                           │
│    POST /api/v1/users/email-create                          │
│    Body: { primaryEmail, password, givenName, ... }         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Express Router (userRoutes.v1.js)                        │
│    - Matches route pattern                                  │
│    - Calls: adminController.createNewUserController         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Controller (adminController.v1.js)                       │
│    - Extracts: { primaryEmail, password, ... } from req.body│
│    - Logs request                                           │
│    - Calls: googleAdminService.createUser(userData)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Service (googleAdminService.js)                          │
│    - Validates required fields                              │
│    - Prepares request body                                  │
│    - Calls: admin.users.insert({ requestBody })             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Google Admin SDK API                                     │
│    - Authenticates service account                          │
│    - Impersonates admin user                                │
│    - Creates user in Google Workspace                       │
│    - Returns: User object                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Response Flow (Back through layers)                      │
│    Service: Returns response.data                           │
│    Controller: Sends res.status(201).json(newUser)          │
│    Client: Receives JSON response                           │
└─────────────────────────────────────────────────────────────┘
```

### Password Reset Flow

```
Client                Controller             Service              Utils           Google API
  │                      │                     │                    │                │
  ├─POST /email-password-reset────────────────▶│                    │                │
  │  {userEmail}         │                     │                    │                │
  │                      │                     │                    │                │
  │                      ├─resetUserPasswordController()────────────▶│                │
  │                      │                     │                    │                │
  │                      │                     ├─generatePassword()─▶│                │
  │                      │                     │                    │                │
  │                      │                     │◀────returns newPwd─┤                │
  │                      │                     │                    │                │
  │                      │                     ├─admin.users.update()───────────────▶│
  │                      │                     │  {password, changePasswordAtNextLogin}
  │                      │                     │                    │                │
  │                      │                     │◀────────────────────────────────────┤
  │                      │                     │  (success)         │                │
  │                      │                     │                    │                │
  │                      │◀────returns {message, newPassword}───────┤                │
  │                      │                     │                    │                │
  │◀─────200 OK─────────┤                     │                    │                │
  │  {message, newPassword}                   │                    │                │
  │                      │                     │                    │                │
```

---

## Security Architecture

### Authentication & Authorization

#### Service Account Authentication

```javascript
// Domain-Wide Delegation Configuration
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,              // Service account private key
    scopes: SCOPES,                         // Required permissions
    clientOptions: {
        subject: ADMIN_EMAIL_TO_IMPERSONATE // Admin to impersonate
    },
});
```

**Security Model:**
1. **Service Account** - Machine account with private key
2. **Domain-Wide Delegation** - Permission to act on behalf of users
3. **Admin Impersonation** - Acts as specified admin email
4. **Scoped Access** - Limited to specific API permissions

#### OAuth 2.0 Scopes

```javascript
const SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.user',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
];
```

**Principle of Least Privilege:**
- Only request necessary scopes
- Read-only scope for listing operations
- Write scope only when needed

### Credential Management

#### Environment Variables
```bash
# Sensitive credentials stored in .env
ADMIN_EMAIL=admin@domain.com
DOMAIN_EMAIL=domain.com
SERVER_IP_ADDRESS=0.0.0.0
SERVER_PORT=3000
```

**Best Practices:**
- Never commit `.env` to version control
- Use `.env.example` as template
- Rotate credentials regularly
- Limit credential access

#### Service Account Key File
```
google-credentials.json (Not in git)
```

**Security Measures:**
- Excluded from version control (`.gitignore`)
- File permissions: Read-only for app user
- Stored securely in production
- Regular key rotation

### Input Validation

```javascript
// Service layer validation
if (!primaryEmail || !password || !givenName || !familyName) {
    throw new Error('User data is not complete');
}

// Email format validation (implicit by Google API)
// Password strength validation (consider implementing)
```

**Validation Strategy:**
- Required field checking
- Type validation
- Business rule validation
- Delegate format validation to Google API

### Password Security

```javascript
// Password Generation (passwordGenerator.js)
function generatePassword(length = 12) {
    // Minimum length enforcement
    if (length < 8) {
        length = 8;
    }

    // Character diversity
    - Lowercase letters (ambiguous chars excluded)
    - Uppercase letters (ambiguous chars excluded)
    - Numbers (ambiguous chars excluded)
    - Special characters

    // Cryptographically random
    - Math.random() (Note: Use crypto.randomBytes for production)

    // Guaranteed complexity
    - At least one from each category
}
```

**Password Policy:**
- Minimum 8 characters (default 12)
- Mixed case required
- Numbers required
- Special characters required
- Force change on first login
- Never logged or stored

### Error Handling Security

```javascript
// Don't expose internal details to clients
catch (error) {
    console.error('Internal error:', error); // Log full error
    res.status(500).json({
        message: 'Operation failed',  // Generic message
        error: error.errors           // Limited error info
    });
}
```

**Security Principles:**
- Log detailed errors server-side
- Return generic errors to clients
- Don't expose stack traces
- Don't reveal system internals

---

## Scalability Considerations

### Horizontal Scaling

The application is designed to be **stateless**, enabling horizontal scaling:

```
                    Load Balancer
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    Instance 1       Instance 2       Instance 3
    (Container)      (Container)      (Container)
         │                │                │
         └────────────────┴────────────────┘
                          │
                    Google APIs
```

**Stateless Design:**
- No session storage
- No in-memory state
- All state in Google Workspace
- Each request is independent

**Container Orchestration:**
```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: middleware-google
spec:
  replicas: 3  # Scale to 3 instances
  selector:
    matchLabels:
      app: middleware-google
  template:
    # Pod template
```

### Performance Optimization

#### Connection Pooling
```javascript
// Google API client maintains connection pool
const admin = google.admin({
    version: 'directory_v1',
    auth,
    timeout: 30000,  // Request timeout
    retry: true,     // Automatic retry
});
```

#### Caching Strategy (Future Enhancement)
```javascript
// Potential caching layer
const NodeCache = require('node-cache');
const userCache = new NodeCache({ stdTTL: 300 }); // 5 min TTL

async function listAllUsers(domain) {
    const cacheKey = `users:${domain}`;

    // Check cache
    const cached = userCache.get(cacheKey);
    if (cached) return cached;

    // Fetch from API
    const users = await admin.users.list({ domain });

    // Store in cache
    userCache.set(cacheKey, users);

    return users;
}
```

### Rate Limiting

#### Google API Quotas
- **QPS Limit**: 20 queries/second
- **Daily Quota**: 150,000 requests/day

#### Mitigation Strategies
```javascript
// 1. Automatic Retry (Built-in)
const admin = google.admin({
    retry: true  // Exponential backoff
});

// 2. Request Batching (Future)
// Batch multiple operations into single request

// 3. Client-side Rate Limiting (Future)
const Bottleneck = require('bottleneck');
const limiter = new Bottleneck({
    minTime: 50,  // Min 50ms between requests (20 QPS)
    maxConcurrent: 5
});
```

### Database Considerations (Future)

For audit logging and caching:
```
PostgreSQL / MongoDB
        │
        ├─ User operation logs
        ├─ Audit trail
        ├─ Cache layer
        └─ Analytics data
```

---

## Design Patterns

### 1. Layered Architecture Pattern
- **Pattern**: Separation of concerns into layers
- **Benefit**: Modularity, testability, maintainability
- **Implementation**: Routes → Controllers → Services → Utils

### 2. Dependency Injection
```javascript
// Controllers depend on services (imported)
const googleAdminService = require('../../../services/googleAdminService');

// Allows easy mocking for testing
```

### 3. Error Handling Pattern
```javascript
// Centralized error handler in service layer
function handleGoogleAPIError(error, operation) {
    // Log, transform, and throw
}

// Controllers catch and format for HTTP response
```

### 4. Factory Pattern
```javascript
// Google API client factory
const auth = new google.auth.GoogleAuth({...});
const admin = google.admin({ version: 'directory_v1', auth });
```

### 5. Module Pattern
```javascript
// Export public API, hide implementation
module.exports = {
    listAllUsers,
    createUser,
    suspendUser,
    // ... other public functions
};
```

---

## Dependencies

### Production Dependencies

#### express (v5.1.0)
- **Purpose**: Web framework
- **Usage**: HTTP server, routing, middleware
- **Why**: Industry standard, mature, extensive ecosystem

#### googleapis (v154.1.0)
- **Purpose**: Google API client library
- **Usage**: Admin SDK, People API integration
- **Why**: Official Google library, comprehensive, well-maintained

#### dotenv (v17.2.1)
- **Purpose**: Environment variable management
- **Usage**: Load configuration from `.env` file
- **Why**: Standard for Node.js configuration, simple

### Development Dependencies

#### nodemon (v3.1.10)
- **Purpose**: Development server with auto-reload
- **Usage**: Watch files and restart on changes
- **Why**: Improves development experience

### Dependency Management

```json
{
  "dependencies": {
    "dotenv": "^17.2.1",      // Minor updates allowed
    "express": "^5.1.0",      // Minor updates allowed
    "googleapis": "^154.1.0"  // Minor updates allowed
  }
}
```

**Update Policy:**
- Caret (^) allows minor and patch updates
- Regular security audits: `npm audit`
- Dependency updates: `npm update`
- Breaking changes reviewed carefully

---

## Future Enhancements

### 1. Authentication Layer
Add API key or JWT authentication:
```javascript
// Middleware for API key authentication
app.use('/api', apiKeyAuth);
```

### 2. Request Validation
Implement schema validation:
```javascript
const Joi = require('joi');

const createUserSchema = Joi.object({
    primaryEmail: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    // ...
});
```

### 3. Logging Framework
Replace console.log with structured logging:
```javascript
const winston = require('winston');

logger.info('User created', {
    email: primaryEmail,
    timestamp: new Date()
});
```

### 4. Monitoring & Metrics
Add application monitoring:
```javascript
const prometheus = require('prom-client');

const httpRequestCounter = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests'
});
```

### 5. Caching Layer
Implement Redis caching:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache user lists
await client.setex(`users:${domain}`, 300, JSON.stringify(users));
```

### 6. Rate Limiting Middleware
Protect against abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 7. Health Check Endpoint
Comprehensive health monitoring:
```javascript
app.get('/health', async (req, res) => {
    const health = {
        uptime: process.uptime(),
        googleApi: await testGoogleConnection(),
        memory: process.memoryUsage(),
        timestamp: Date.now()
    };
    res.json(health);
});
```

---

## Conclusion

The middleware architecture follows industry best practices for:
- **Modularity**: Clear separation of concerns
- **Scalability**: Stateless, containerized design
- **Security**: Secure credential management and error handling
- **Maintainability**: Clean code, single responsibility principle
- **Reliability**: Comprehensive error handling and logging

This foundation enables easy extension and maintenance while providing a robust interface to Google Workspace administration.

---

**Document Version:** 1.0.0
**Last Updated:** November 26, 2025
**Maintained By:** Architecture Team
