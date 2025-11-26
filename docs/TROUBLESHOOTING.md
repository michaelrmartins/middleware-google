# Troubleshooting Guide

## Table of Contents
- [Common Errors](#common-errors)
- [Authentication Issues](#authentication-issues)
- [API Errors](#api-errors)
- [Docker Issues](#docker-issues)
- [Network Issues](#network-issues)
- [Performance Issues](#performance-issues)
- [Debugging Techniques](#debugging-techniques)
- [FAQ](#faq)

---

## Common Errors

### Error: "ADMIN_EMAIL is not present in environment variables"

**Error Message:**
```
Error: ADMIN_EMAIL is not present in environment variables
    at Object.<anonymous> (src/services/googleAdminService.js:23:11)
```

**Cause:**
- `.env` file is missing or not loaded
- `ADMIN_EMAIL` variable not set in `.env`
- Incorrect variable name (typo)

**Solution:**

```bash
# 1. Check if .env file exists
ls -la .env

# 2. Verify contents
cat .env

# 3. Ensure ADMIN_EMAIL is set (no spaces around =)
# Correct format:
ADMIN_EMAIL=admin@yourdomain.com

# Wrong format:
ADMIN_EMAIL = admin@yourdomain.com  # Spaces cause issues

# 4. Restart the server
npm run dev
```

**Prevention:**
- Always copy from `.env.example`
- Use exact formatting
- No trailing spaces

---

### Error: "DOMAIN_EMAIL is not present in environment variables"

**Error Message:**
```
Error: DOMAIN_EMAIL is not present in environment variables
    at Object.<anonymous> (src/services/googleAdminService.js:27:11)
```

**Cause:**
Same as ADMIN_EMAIL error

**Solution:**
```bash
# Add to .env
DOMAIN_EMAIL=yourdomain.com

# Verify
grep DOMAIN_EMAIL .env

# Restart
npm run dev
```

---

### Error: "Cannot find module 'googleapis'"

**Error Message:**
```
Error: Cannot find module 'googleapis'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
```

**Cause:**
- Dependencies not installed
- `node_modules` directory missing or corrupted
- Wrong Node.js version

**Solution:**

```bash
# 1. Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Verify installation
npm list googleapis

# Expected output:
# middleware-google@1.0.0
# └── googleapis@154.1.0

# 5. Restart server
npm run dev
```

**Verify Node.js Version:**
```bash
node --version
# Should be v18.x or higher

# If version is too old, install newer version:
# Using nvm (recommended):
nvm install 24
nvm use 24
```

---

### Error: "ENOENT: no such file or directory 'google-credentials.json'"

**Error Message:**
```
Error: ENOENT: no such file or directory, open '/app/google-credentials.json'
    at Object.openSync (node:fs:590:3)
```

**Cause:**
- Service account key file not present
- File in wrong location
- Incorrect file name

**Solution:**

```bash
# 1. Check if file exists
ls -la google-credentials.json

# If missing, copy from download location
cp ~/Downloads/your-key-file.json ./google-credentials.json

# 2. Verify file is in project root
pwd
ls -la google-credentials.json

# 3. Check file permissions
chmod 400 google-credentials.json  # Read-only

# 4. Verify path in code
# Should be: path.join(process.cwd(), 'google-credentials.json')

# 5. Restart server
npm run dev
```

**Docker-specific:**
```bash
# Ensure file exists before building
ls google-credentials.json

# Rebuild container
docker compose down
docker compose up --build
```

---

## Authentication Issues

### Error: "Not Authorized to access this resource/api"

**Error Message:**
```json
{
  "message": "Not Authorized listAllUsers. Check Admin SDK for admin@domain.com",
  "error": {
    "code": 403,
    "message": "Not Authorized to access this resource/api"
  }
}
```

**Cause:**
- Domain-wide delegation not configured
- Incorrect OAuth scopes
- Wrong client ID in Admin Console
- Service account doesn't have required permissions

**Solution:**

**Step 1: Verify Domain-Wide Delegation**

```bash
# Get client ID from service account key
cat google-credentials.json | grep client_id
# Output: "client_id": "123456789012345678901"
```

1. Go to [Google Admin Console](https://admin.google.com)
2. Navigate to: **Security** → **API Controls** → **Domain-wide Delegation**
3. Check if your client ID is listed
4. If not, click **Add new** and add:
   - Client ID: `123456789012345678901`
   - OAuth Scopes:
     ```
     https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.user.readonly
     ```

**Step 2: Verify Admin Email**

```bash
# Check ADMIN_EMAIL in .env
grep ADMIN_EMAIL .env

# Ensure this email:
# 1. Exists in your Google Workspace
# 2. Has admin privileges (preferably super admin)
# 3. Matches exactly (no typos)
```

**Step 3: Verify Service Account**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **IAM & Admin** → **Service Accounts**
3. Find your service account
4. Verify it has **Domain-wide delegation** enabled

**Step 4: Wait for Propagation**

```bash
# Domain-wide delegation can take up to 10 minutes to propagate
# Wait and retry
sleep 600  # Wait 10 minutes
npm run dev
```

---

### Error: "Invalid JWT Signature"

**Error Message:**
```
Error: invalid_grant: Invalid JWT Signature
```

**Cause:**
- Service account key is invalid or expired
- Private key format is incorrect
- Clock skew (time difference between systems)

**Solution:**

**Option 1: Generate New Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **IAM & Admin** → **Service Accounts**
3. Select your service account
4. Go to **Keys** tab
5. Click **Add Key** → **Create new key**
6. Select **JSON**
7. Download and replace `google-credentials.json`

**Option 2: Fix Clock Skew**

```bash
# Check system time
date

# Sync time (Linux)
sudo ntpdate -s time.nist.gov

# Or use timedatectl
sudo timedatectl set-ntp true

# Restart service
npm run dev
```

**Option 3: Verify Key Format**

```bash
# Check if JSON is valid
cat google-credentials.json | jq .

# Ensure private_key has proper newlines
cat google-credentials.json | jq -r .private_key | head -1
# Should start with: -----BEGIN PRIVATE KEY-----
```

---

## API Errors

### Error: 400 - "Missing required fields"

**Error Message:**
```json
{
  "message": "Create user error.",
  "error": "User data is not complete: primaryEmail, password, givenName, familyName, orgUnitPath and changePasswordAtNextLogin are necessary"
}
```

**Cause:**
Request body is missing required fields

**Solution:**

```bash
# Ensure all required fields are present
curl -X POST http://localhost:3000/api/v1/users/email-create \
  -H "Content-Type: application/json" \
  -d '{
    "primaryEmail": "test@domain.com",      # Required
    "password": "TempPass123!",             # Required
    "givenName": "Test",                     # Required
    "familyName": "User",                    # Required
    "orgUnitPath": "/",                      # Required
    "changePasswordAtNextLogin": "true"     # Required
  }'
```

**Check field names:**
- Use `primaryEmail` (not `email`)
- Use `givenName` (not `firstName`)
- Use `familyName` (not `lastName`)

---

### Error: 404 - "User not found"

**Error Message:**
```json
{
  "message": "Resource not found for suspendUser: User not found",
  "error": { "code": 404 }
}
```

**Cause:**
- User email doesn't exist
- Email is misspelled
- User was recently deleted

**Solution:**

```bash
# 1. List all users to verify
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'

# 2. Check exact email spelling
# Ensure domain matches DOMAIN_EMAIL in .env

# 3. Use correct format
# Correct: user@domain.com
# Wrong: user@Domain.com (case matters)
```

---

### Error: 409 - "Entity already exists"

**Error Message:**
```json
{
  "message": "Create user error.",
  "error": "Entity already exists"
}
```

**Cause:**
User with that email already exists

**Solution:**

```bash
# 1. List users to check
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'

# 2. Use different email OR
# 3. Delete existing user first (via Google Admin Console)
```

---

### Error: "Rate limit exceeded"

**Error Message:**
```json
{
  "message": "Rate limit exceeded",
  "error": { "code": 429 }
}
```

**Cause:**
Too many requests to Google API

**Google Admin SDK Quotas:**
- **QPS (Queries Per Second)**: 20
- **Daily Quota**: 150,000 requests

**Solution:**

```bash
# 1. Implement rate limiting in your client
# 2. Add delays between requests
sleep 0.1  # 100ms delay = max 10 req/s

# 3. Batch operations when possible
# 4. Implement exponential backoff

# 5. Check quota usage:
# Go to: https://console.cloud.google.com/apis/api/admin.googleapis.com/quotas
```

**Implement Retry with Backoff (in code):**

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

---

## Docker Issues

### Container Exits Immediately

**Symptom:**
```bash
docker compose ps
# Shows: Exit 1
```

**Diagnosis:**

```bash
# Check logs
docker compose logs

# Common errors:
# - Missing .env
# - Missing google-credentials.json
# - Port already in use
# - Syntax error in code
```

**Solutions:**

**Missing .env:**
```bash
# Create .env file
cp .env.example .env
# Edit with your values
vim .env
```

**Missing credentials:**
```bash
# Copy credentials
cp /path/to/key.json ./google-credentials.json
chmod 644 google-credentials.json  # Docker needs read access
```

**Port conflict:**
```bash
# Find process using port 3000
lsof -i :3000
# or
sudo netstat -tulpn | grep 3000

# Kill process
kill -9 PID

# Or change port in .env
SERVER_PORT=3001
```

**Rebuild:**
```bash
docker compose down
docker compose up --build
```

---

### Cannot Connect to Container

**Symptom:**
```bash
curl http://localhost:3000/
# curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Diagnosis:**

```bash
# 1. Check if container is running
docker compose ps

# 2. Check port mapping
docker compose ps
# Look for: 0.0.0.0:3000->3000/tcp

# 3. Check container logs
docker compose logs -f
```

**Solutions:**

**Container not running:**
```bash
docker compose up -d
```

**Wrong port mapping:**
```yaml
# In docker-compose.yml
services:
  middleware-google:
    ports:
      - "3000:3000"  # HOST:CONTAINER
```

**Server not listening on 0.0.0.0:**
```bash
# In .env
SERVER_IP_ADDRESS=0.0.0.0  # Not 127.0.0.1
```

---

### Volume Mount Issues

**Symptom:**
Changes to code don't reflect in container

**Solution:**

```bash
# 1. Verify volume mount
docker compose config
# Check volumes section

# 2. Restart container
docker compose restart

# 3. If using nodemon, check logs
docker compose logs -f
# Should see: [nodemon] restarting due to changes...

# 4. Rebuild if necessary
docker compose up --build
```

---

## Network Issues

### DNS Resolution Failure

**Error:**
```
Error: getaddrinfo ENOTFOUND www.googleapis.com
```

**Cause:**
Cannot resolve Google API domain

**Solution:**

```bash
# Test DNS resolution
nslookup www.googleapis.com

# If fails, try different DNS
# Edit /etc/resolv.conf (Linux) or network settings

# Use Google DNS
nameserver 8.8.8.8
nameserver 8.8.4.4

# Restart network
sudo systemctl restart networking

# Or for Docker
docker restart container-name
```

---

### Firewall Blocking Requests

**Symptom:**
Requests to Google APIs timeout

**Solution:**

```bash
# Allow outbound HTTPS
sudo ufw allow out 443/tcp

# For corporate firewalls:
# 1. Get your network admin to whitelist:
#    - *.googleapis.com
#    - *.google.com
#    - oauth2.googleapis.com

# 2. Configure proxy if needed (in .env)
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

---

## Performance Issues

### Slow API Response

**Symptom:**
API calls take >5 seconds

**Diagnosis:**

```bash
# Time the request
time curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'

# Check server logs for timing information
```

**Solutions:**

**1. Optimize Google API calls:**

```javascript
// Reduce maxResults if not needed
const response = await admin.users.list({
  domain: domain,
  maxResults: 100,  // Instead of 500
});
```

**2. Implement caching:**

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

async function listAllUsers(domain) {
  const cacheKey = `users:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const users = await fetchFromGoogleAPI(domain);
  cache.set(cacheKey, users);
  return users;
}
```

**3. Check network latency:**

```bash
# Ping Google API
ping www.googleapis.com

# Traceroute
traceroute www.googleapis.com
```

---

### Memory Leaks

**Symptom:**
Memory usage grows over time

**Diagnosis:**

```bash
# Monitor memory
docker stats

# Or in Node.js
curl http://localhost:3000/health
# Check memory field
```

**Solution:**

```javascript
// Ensure all event listeners are removed
// Close all connections properly

// Add memory monitoring
const used = process.memoryUsage();
console.log(`Memory usage: ${used.heapUsed / 1024 / 1024} MB`);

// Set Node.js memory limit
node --max-old-space-size=512 server.js
```

---

## Debugging Techniques

### Enable Debug Logging

```bash
# Set log level in .env
LOG_LEVEL=debug

# Or via environment variable
LOG_LEVEL=debug npm run dev
```

### Use Node.js Inspector

```bash
# Start with debugger
node --inspect server.js

# Open Chrome DevTools
# Navigate to: chrome://inspect
# Click: "Open dedicated DevTools for Node"
```

### Add Strategic Console Logs

```javascript
// Add timing information
console.time('createUser');
const user = await googleAdminService.createUser(userData);
console.timeEnd('createUser');

// Log full objects
console.log('Request body:', JSON.stringify(req.body, null, 2));
console.log('Response data:', JSON.stringify(response.data, null, 2));

// Log stack traces
console.trace('Function called from:');
```

### Test Google API Directly

```bash
# Test with gcloud CLI
gcloud auth activate-service-account --key-file=google-credentials.json

gcloud beta directory users list \
  --customer=my_customer \
  --impersonate-service-account=admin@domain.com
```

---

## FAQ

### Q: Can I use multiple service accounts?

**A:** Yes, but you need separate instances or configure dynamically:

```javascript
function getAdminClient(serviceAccountPath, adminEmail) {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: SCOPES,
    clientOptions: { subject: adminEmail },
  });

  return google.admin({ version: 'directory_v1', auth });
}
```

---

### Q: How do I test without affecting production users?

**A:** Use a test domain or organizational unit:

```bash
# In .env
DOMAIN_EMAIL=test.yourdomain.com

# Or target specific OU
ORG_UNIT_PATH=/Test
```

```javascript
// In service
const response = await admin.users.list({
  domain: domain,
  query: `orgUnitPath='/Test'`,  // Only test users
});
```

---

### Q: How do I handle service account key rotation?

**A:**

```bash
# 1. Generate new key (don't delete old one yet)
# 2. Test with new key
mv google-credentials.json google-credentials-old.json
cp new-key.json google-credentials.json
npm run dev
# Test all endpoints

# 3. Deploy new key to production
# 4. Monitor for errors
# 5. Delete old key after 24-48 hours
```

---

### Q: Can I run multiple instances?

**A:** Yes, the service is stateless:

```bash
# Docker Compose (scale)
docker compose up -d --scale middleware-google=3

# Kubernetes
kubectl scale deployment middleware-google --replicas=5
```

---

### Q: How do I debug "socket hang up" errors?

**Error:** `Error: socket hang up`

**Causes:**
- Network interruption
- Google API timeout
- Load balancer timeout

**Solutions:**

```javascript
// Increase timeout
const admin = google.admin({
  version: 'directory_v1',
  auth,
  timeout: 60000,  // 60 seconds
  retry: true,
});

// Implement retry logic
async function retryOperation(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries}`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Getting More Help

### Check Logs

```bash
# Application logs
tail -f logs/combined.log

# Docker logs
docker compose logs -f

# System logs (Linux)
journalctl -u service-name -f
```

### Enable Verbose Logging

```bash
# Google API client debug
DEBUG=google-api-nodejs-client npm run dev

# All debug output
DEBUG=* npm run dev
```

### Useful Resources

- [Google Admin SDK Documentation](https://developers.google.com/admin-sdk/directory)
- [Google API Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Docker Documentation](https://docs.docker.com/)

### Report Issues

If you can't resolve your issue:

1. Check existing issues: [GitHub Issues](https://github.com/yourusername/middleware-google/issues)
2. Create new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (OS, Node version, Docker version)
   - Relevant configuration (without secrets)
   - Logs (without sensitive data)

---

**Document Version:** 1.0.0
**Last Updated:** November 26, 2025
