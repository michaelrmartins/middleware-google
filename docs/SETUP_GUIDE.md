# Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Google Cloud Platform Setup](#google-cloud-platform-setup)
- [Google Workspace Configuration](#google-workspace-configuration)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [Environment Configuration](#environment-configuration)
- [Verification](#verification)
- [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose | Download Link |
|----------|----------------|---------|---------------|
| **Node.js** | 18.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x or higher | Package manager | Included with Node.js |
| **Docker** | 20.x or higher | Containerization (optional) | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.x or higher | Multi-container orchestration (optional) | Included with Docker Desktop |
| **Git** | 2.x or higher | Version control | [git-scm.com](https://git-scm.com/) |

### Verify Installations

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: 9.x.x or higher

# Check Docker version (if using Docker)
docker --version
# Expected output: Docker version 20.x.x or higher

# Check Docker Compose version (if using Docker)
docker compose version
# Expected output: Docker Compose version v2.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.x.x or higher
```

---

## Google Cloud Platform Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project details:
   - **Project name**: `middleware-google` (or your preferred name)
   - **Organization**: Select your organization
   - **Location**: Select appropriate location
4. Click **Create**
5. Note your **Project ID** (e.g., `middleware-google-123456`)

### Step 2: Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search and enable the following APIs:
   - **Admin SDK API**
   - **Google People API** (for testing)

#### Enable Admin SDK API
```bash
# Via gcloud CLI (alternative method)
gcloud services enable admin.googleapis.com --project=YOUR_PROJECT_ID
```

1. Search for "Admin SDK API"
2. Click **Enable**
3. Wait for activation (may take a few seconds)

#### Enable People API
1. Search for "Google People API"
2. Click **Enable**
3. Wait for activation

### Step 3: Create a Service Account

1. Navigate to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Enter service account details:
   - **Service account name**: `workspace-admin-service`
   - **Service account ID**: `workspace-admin-service` (auto-generated)
   - **Description**: `Service account for Google Workspace user management`
4. Click **Create and Continue**
5. **Grant access** (optional at this stage, skip for now)
6. Click **Done**

### Step 4: Create Service Account Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** as key type
5. Click **Create**
6. A JSON file will be downloaded automatically
7. **IMPORTANT**: Store this file securely and never commit to version control

**Downloaded file structure:**
```json
{
  "type": "service_account",
  "project_id": "middleware-google-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "workspace-admin-service@middleware-google-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Rename and store:**
```bash
# Rename the downloaded file to google-credentials.json
mv ~/Downloads/middleware-google-*.json google-credentials.json

# Move to your project root (do this after cloning the repository)
mv google-credentials.json /path/to/middleware-google/
```

### Step 5: Note Important Values

From the service account key file, note:
- **Client Email**: `workspace-admin-service@middleware-google-123456.iam.gserviceaccount.com`
- **Client ID**: Found in the JSON file

---

## Google Workspace Configuration

### Step 1: Access Google Workspace Admin Console

1. Go to [Google Admin Console](https://admin.google.com/)
2. Sign in with your **Google Workspace super admin** account
3. You must have super admin privileges to configure domain-wide delegation

### Step 2: Enable Domain-Wide Delegation

1. In Admin Console, navigate to:
   - **Security** → **Access and data control** → **API controls**
2. Scroll to **Domain-wide delegation** section
3. Click **Manage Domain Wide Delegation**
4. Click **Add new**

### Step 3: Configure Client Access

1. Enter the **Client ID** from your service account
   - Find in the downloaded JSON file: `"client_id": "123456789012345678901"`
2. Enter **OAuth Scopes** (comma-separated):
   ```
   https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.user.readonly
   ```
3. Click **Authorize**

### Step 4: Verify Configuration

1. You should see the new entry in the domain-wide delegation list:
   - **Client ID**: Your service account client ID
   - **Client Name**: Service account email
   - **Scopes**: The two directory scopes
   - **Status**: Authorized

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/middleware-google.git

# Navigate to project directory
cd middleware-google

# Verify files
ls -la
```

### Step 2: Install Dependencies

```bash
# Install all dependencies from package.json
npm install

# Verify installation
npm list --depth=0
```

**Expected output:**
```
middleware-google@1.0.0
├── dotenv@17.2.1
├── express@5.1.0
├── googleapis@154.1.0
└── nodemon@3.1.10
```

### Step 3: Copy Google Credentials

```bash
# Copy the service account key file to project root
cp /path/to/downloaded/key.json ./google-credentials.json

# Verify the file exists
ls -la google-credentials.json

# Ensure proper permissions (read-only for security)
chmod 400 google-credentials.json
```

### Step 4: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file
nano .env
# or
vim .env
# or use your preferred editor
```

**Edit `.env` with your values:**
```bash
# Server Parameters
SERVER_IP_ADDRESS=0.0.0.0
SERVER_PORT=3000

# Google Cloud Parameters
ADMIN_EMAIL=admin@yourdomain.com
DOMAIN_EMAIL=yourdomain.com
```

**Parameter Explanations:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `SERVER_IP_ADDRESS` | Server bind address (0.0.0.0 for all interfaces) | `0.0.0.0` |
| `SERVER_PORT` | Port number for the server | `3000` |
| `ADMIN_EMAIL` | Google Workspace admin email to impersonate | `admin@example.com` |
| `DOMAIN_EMAIL` | Your Google Workspace domain | `example.com` |

**Important Notes:**
- `ADMIN_EMAIL` must be a super admin or have user management permissions
- `DOMAIN_EMAIL` must match your Google Workspace domain
- Never commit `.env` to version control (already in `.gitignore`)

### Step 5: Verify File Structure

```bash
# Check that all necessary files are in place
tree -L 2 -a
```

**Expected structure:**
```
.
├── .dockerignore
├── .env                          # Created by you
├── .env.example
├── .gitignore
├── Dockerfile
├── app.js
├── docker-compose.yml
├── google-credentials.json       # Created by you
├── package-lock.json
├── package.json
├── readme.md
├── server.js
└── src/
    ├── api/
    ├── services/
    └── utils/
```

### Step 6: Start Development Server

```bash
# Start with nodemon (auto-restart on file changes)
npm run dev

# Or start with node (manual restart required)
npm start
```

**Expected output:**
```
> middleware-google@1.0.0 dev
> nodemon server.js

[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Middleware Google App is starting...
--- DEBUGGING FOR GOOGLE ADMIN SERVICE ---
ADMIN_EMAIL from environment: admin@yourdomain.com
DOMAIN_EMAIL from environment: yourdomain.com
------------------------------------
Server is starting...
Server running at http://0.0.0.0:3000/
```

---

## Docker Setup

### Step 1: Prepare Docker Environment

```bash
# Ensure you're in the project directory
cd /path/to/middleware-google

# Verify Docker is running
docker ps
```

### Step 2: Review Docker Configuration

**Dockerfile** (already configured):
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml** (already configured):
```yaml
services:
  middleware-google:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm run dev
    env_file:
      - .env
```

### Step 3: Ensure Required Files Exist

```bash
# Make sure these files exist
ls -la .env google-credentials.json

# If google-credentials.json is missing, copy it:
cp /path/to/key.json ./google-credentials.json
```

### Step 4: Build Docker Image

```bash
# Build the Docker image
docker compose build

# Expected output:
# [+] Building 45.2s (10/10) FINISHED
# ...
```

### Step 5: Start Docker Container

```bash
# Start the container in detached mode
docker compose up -d

# Or start with logs visible
docker compose up
```

**Expected output:**
```
[+] Running 1/1
 ✔ Container middleware-google-middleware-google-1  Started
```

### Step 6: Verify Container is Running

```bash
# Check container status
docker compose ps

# Expected output:
# NAME                                    IMAGE                      STATUS
# middleware-google-middleware-google-1   middleware-google:latest   Up X seconds

# View container logs
docker compose logs -f

# Stop viewing logs: Ctrl+C
```

### Step 7: Docker Management Commands

```bash
# Stop the container
docker compose down

# Restart the container
docker compose restart

# View real-time logs
docker compose logs -f

# Execute commands inside the container
docker compose exec middleware-google sh

# Rebuild and restart
docker compose up -d --build

# Remove containers and volumes
docker compose down -v
```

---

## Environment Configuration

### Environment Variables Reference

#### Server Configuration

```bash
# SERVER_IP_ADDRESS
# - Purpose: IP address the server binds to
# - Values:
#   - 0.0.0.0: Listen on all network interfaces (Docker recommended)
#   - 127.0.0.1: Listen only on localhost (development)
#   - Specific IP: Listen on specific network interface
SERVER_IP_ADDRESS=0.0.0.0

# SERVER_PORT
# - Purpose: Port number for the HTTP server
# - Values: 1024-65535 (avoid ports < 1024 without sudo)
# - Default: 3000
SERVER_PORT=3000
```

#### Google Workspace Configuration

```bash
# ADMIN_EMAIL
# - Purpose: Google Workspace admin email for impersonation
# - Requirements:
#   - Must be a valid user in your Google Workspace domain
#   - Must have admin privileges (super admin or user management)
#   - Service account will act as this user
# - Example: admin@example.com
ADMIN_EMAIL=admin@yourdomain.com

# DOMAIN_EMAIL
# - Purpose: Your Google Workspace primary domain
# - Requirements:
#   - Must match your Google Workspace domain exactly
#   - Used for listing all users in the domain
# - Example: example.com
DOMAIN_EMAIL=yourdomain.com
```

### Configuration Files

#### google-credentials.json

**Purpose**: Service account private key for Google API authentication

**Location**: Project root directory

**Security:**
- Never commit to version control
- Set file permissions to 400 (read-only)
- Store backup securely
- Rotate keys regularly (every 90 days recommended)

**Permissions:**
```bash
# Set secure permissions (Linux/Mac)
chmod 400 google-credentials.json

# Verify permissions
ls -l google-credentials.json
# Expected: -r-------- 1 user group 2358 Nov 26 10:00 google-credentials.json
```

#### .dockerignore

Excludes files from Docker build context:
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.DS_Store
*.log
```

#### .gitignore

Prevents committing sensitive files:
```
node_modules/
.env
google-credentials.json
*.log
.DS_Store
```

---

## Verification

### Step 1: Test Server Connection

```bash
# Test root endpoint
curl http://localhost:3000/

# Expected output:
# Google API - Home
```

### Step 2: Test User Routes

```bash
# Test user routes endpoint
curl http://localhost:3000/api/v1/users/

# Expected output:
# User route is working!
```

### Step 3: Test Google Authentication

```bash
# Test authentication with Google People API
curl http://localhost:3000/api/v1/test/whoami

# Expected output (formatted for readability):
# {
#   "resourceName": "people/...",
#   "names": [...],
#   "emailAddresses": [
#     {
#       "value": "workspace-admin-service@project.iam.gserviceaccount.com"
#     }
#   ]
# }
```

### Step 4: Test User Listing

```bash
# List all users in domain
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected output:
# Array of user objects from your domain
```

**Successful response:**
```json
[
  {
    "kind": "admin#directory#user",
    "id": "...",
    "primaryEmail": "user@yourdomain.com",
    "name": {
      "givenName": "First",
      "familyName": "Last",
      "fullName": "First Last"
    },
    ...
  }
]
```

### Step 5: Verify Logging

Check the console output for:
```
--- DEBUGGING FOR GOOGLE ADMIN SERVICE ---
ADMIN_EMAIL from environment: admin@yourdomain.com
DOMAIN_EMAIL from environment: yourdomain.com
------------------------------------
Server is starting...
Server running at http://0.0.0.0:3000/
```

---

## Common Issues

### Issue 1: "ADMIN_EMAIL is not present in environment variables"

**Cause**: `.env` file not loaded or missing `ADMIN_EMAIL`

**Solution:**
```bash
# Verify .env file exists
cat .env

# Check for ADMIN_EMAIL variable
grep ADMIN_EMAIL .env

# Ensure no extra spaces
# Correct: ADMIN_EMAIL=admin@domain.com
# Wrong:   ADMIN_EMAIL = admin@domain.com
```

### Issue 2: "Error: Cannot find module 'googleapis'"

**Cause**: Dependencies not installed

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list googleapis
```

### Issue 3: "Not Authorized" Error When Listing Users

**Cause**: Domain-wide delegation not configured correctly

**Solution:**
1. Verify client ID in Google Admin Console:
   - Go to [admin.google.com](https://admin.google.com)
   - Security → API Controls → Domain-wide delegation
   - Check that your service account client ID is listed
2. Verify OAuth scopes are correct:
   ```
   https://www.googleapis.com/auth/admin.directory.user
   https://www.googleapis.com/auth/admin.directory.user.readonly
   ```
3. Verify `ADMIN_EMAIL` is a super admin or has user management permissions

### Issue 4: "ENOENT: no such file or directory 'google-credentials.json'"

**Cause**: Service account key file missing or in wrong location

**Solution:**
```bash
# Check if file exists
ls -la google-credentials.json

# If missing, copy from download location
cp ~/Downloads/key-file.json ./google-credentials.json

# Verify path in code (src/services/googleAdminService.js)
# Should be: path.join(process.cwd(), 'google-credentials.json')
```

### Issue 5: Docker Container Exits Immediately

**Cause**: Missing .env file or google-credentials.json

**Solution:**
```bash
# Stop containers
docker compose down

# Verify files exist
ls -la .env google-credentials.json

# Rebuild and start
docker compose up --build
```

### Issue 6: Port Already in Use

**Cause**: Another service using port 3000

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# or on Linux
sudo netstat -tulpn | grep 3000

# Kill the process
kill -9 PID

# Or change port in .env
SERVER_PORT=3001
```

### Issue 7: Permission Denied for google-credentials.json

**Cause**: Incorrect file permissions

**Solution:**
```bash
# Set correct permissions
chmod 400 google-credentials.json

# If in Docker, ensure file is readable
chmod 644 google-credentials.json  # Less secure but necessary for Docker
```

---

## Next Steps

After successful setup:

1. Read the [API Documentation](./API_DOCUMENTATION.md) to understand available endpoints
2. Review the [Development Guide](./DEVELOPMENT_GUIDE.md) for contribution guidelines
3. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues
4. Review the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for production deployment

---

## Quick Reference

### Start Development Server
```bash
# Local
npm run dev

# Docker
docker compose up -d
```

### Stop Server
```bash
# Local
Ctrl+C

# Docker
docker compose down
```

### View Logs
```bash
# Local
# Logs appear in console

# Docker
docker compose logs -f
```

### Test API
```bash
# Health check
curl http://localhost:3000/

# List users
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" -d '{}'
```

---

## Security Checklist

Before going to production, ensure:

- [ ] `.env` file is not committed to version control
- [ ] `google-credentials.json` is not committed to version control
- [ ] Service account key has appropriate permissions (not owner/editor)
- [ ] Environment variables are securely managed (secrets manager in production)
- [ ] File permissions are restrictive (400 for credentials)
- [ ] HTTPS is enabled (use reverse proxy in production)
- [ ] API authentication is implemented (JWT, API keys, etc.)
- [ ] Rate limiting is configured
- [ ] Logging is configured (don't log sensitive data)
- [ ] Error messages don't expose internal details
- [ ] Service account keys are rotated regularly

---

**Document Version:** 1.0.0
**Last Updated:** November 26, 2025
