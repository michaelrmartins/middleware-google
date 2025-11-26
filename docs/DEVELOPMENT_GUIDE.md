# Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Debugging](#debugging)
- [Git Workflow](#git-workflow)
- [Best Practices](#best-practices)
- [Code Review Guidelines](#code-review-guidelines)

---

## Getting Started

### Prerequisites

Ensure you have completed the [Setup Guide](./SETUP_GUIDE.md) before proceeding with development.

### Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/middleware-google.git
cd middleware-google

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
vim .env

# Start development server with auto-reload
npm run dev
```

### IDE Setup

#### VS Code (Recommended)

**Recommended Extensions:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "christian-kohler.path-intellisense",
    "christian-kohler.npm-intellisense",
    "aaron-bond.better-comments",
    "eamodio.gitlens"
  ]
}
```

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.suggest.autoImports": true,
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

---

## Development Workflow

### 1. Daily Development Cycle

```bash
# Start your day
git pull origin master                 # Get latest changes
npm install                            # Update dependencies if package.json changed
npm run dev                            # Start development server

# Make changes
# ... edit files ...

# Test changes
curl http://localhost:3000/...         # Manual API testing

# Commit changes
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

### 2. Feature Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. Create Feature Branch                                │
│    git checkout -b feature/user-search                  │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Implement Feature                                    │
│    - Write controller                                   │
│    - Write service                                      │
│    - Write routes                                       │
│    - Test manually                                      │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Test & Debug                                         │
│    - Test all endpoints                                 │
│    - Check error handling                               │
│    - Verify logging                                     │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Commit & Push                                        │
│    git commit -m "feat: add user search endpoint"       │
│    git push origin feature/user-search                  │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Create Pull Request                                  │
│    - Fill PR template                                   │
│    - Request review                                     │
│    - Address feedback                                   │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Merge to Master                                      │
│    - Squash commits if needed                           │
│    - Delete feature branch                              │
└─────────────────────────────────────────────────────────┘
```

---

## Code Style Guide

### JavaScript Style

#### 1. Naming Conventions

```javascript
// Use camelCase for variables and functions
const userName = 'John Doe';
const userEmail = 'john@example.com';

function createUser(userData) {
  // ...
}

// Use PascalCase for classes (if used)
class UserManager {
  // ...
}

// Use UPPER_CASE for constants
const MAX_USERS = 500;
const API_TIMEOUT = 30000;

// Use descriptive names
// Good
const userEmailAddress = req.body.email;
const suspendedUserCount = 0;

// Bad
const e = req.body.email;
const cnt = 0;
```

#### 2. Function Structure

```javascript
// Use async/await for asynchronous operations
async function createUser(userData) {
  try {
    // Validate input first
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Perform operation
    const result = await googleAdminService.createUser(userData);

    // Return result
    return result;
  } catch (error) {
    // Handle error
    console.error('Create user error:', error);
    throw error;
  }
}

// Avoid callback hell
// Bad
function createUser(userData, callback) {
  validateUser(userData, (err, valid) => {
    if (err) return callback(err);
    insertUser(valid, (err, user) => {
      if (err) return callback(err);
      callback(null, user);
    });
  });
}
```

#### 3. Error Handling

```javascript
// Always use try-catch for async functions
async function controllerFunction(req, res) {
  try {
    // Extract parameters
    const { userEmail } = req.body;

    // Validate
    if (!userEmail) {
      return res.status(400).json({ message: 'Email required' });
    }

    // Call service
    const result = await service.someOperation(userEmail);

    // Return success
    res.status(200).json(result);
  } catch (error) {
    // Log error (with context)
    console.error('Controller operation error:', error.message);

    // Return error response
    res.status(500).json({
      message: 'Operation failed',
      error: error.message
    });
  }
}
```

#### 4. Comments and Documentation

```javascript
/**
 * Creates a new Google Workspace user.
 *
 * @param {Object} userData - User information
 * @param {string} userData.primaryEmail - User's email address
 * @param {string} userData.password - Initial password
 * @param {string} userData.givenName - First name
 * @param {string} userData.familyName - Last name
 * @param {string} userData.orgUnitPath - Organizational unit path
 * @returns {Promise<Object>} Created user object
 * @throws {Error} If required fields are missing or user creation fails
 */
async function createUser(userData) {
  // Implementation
}

// Use inline comments for complex logic
// Check if user must change password (handle both string and boolean)
const mustChangePassword = changePasswordAtNextLogin === 'true' ||
                          changePasswordAtNextLogin === true;
```

#### 5. Module Exports

```javascript
// Export multiple functions
module.exports = {
  listAllUsersController,
  createNewUserController,
  suspendUserController,
  reactivateUserController,
  getUserInfosController,
  resetUserPasswordController
};

// Or export as you define
exports.createUser = async function(userData) {
  // ...
};
```

### File Organization

```javascript
// 1. Imports at the top
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.v1');

// 2. Constants
const MAX_RESULTS = 500;
const DEFAULT_ORG_UNIT = '/';

// 3. Configuration
const config = {
  timeout: 30000,
  retry: true
};

// 4. Helper functions (private)
function validateEmail(email) {
  // ...
}

// 5. Main functions (exported)
async function createUser(userData) {
  // ...
}

// 6. Exports at the bottom
module.exports = {
  createUser
};
```

---

## Project Structure

### Adding Files

Follow the established directory structure:

```
src/
├── api/
│   └── v1/
│       ├── controllers/
│       │   ├── adminController.v1.js
│       │   ├── googleTestController.v1.js
│       │   └── newController.v1.js         # Add new controllers here
│       └── routes/
│           ├── index.v1.js
│           ├── userRoutes.v1.js
│           └── newRoutes.v1.js             # Add new routes here
├── services/
│   ├── googleAdminService.js
│   └── newService.js                        # Add new services here
└── utils/
    ├── passwordGenerator.js
    └── newUtil.js                           # Add new utilities here
```

### Version Naming Convention

All API v1 files should include `.v1` suffix:
- `adminController.v1.js` ✓
- `userRoutes.v1.js` ✓
- `adminController.js` ✗

---

## Adding New Features

### Example: Add User Search Endpoint

#### Step 1: Create Service Function

**File:** `src/services/googleAdminService.js`

```javascript
/**
 * Search users by email or name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching users
 */
async function searchUsers(query) {
    console.log(`Searching users with query: ${query}`);

    try {
        if (!query) {
            throw new Error('Search query is required');
        }

        const response = await admin.users.list({
            domain: process.env.DOMAIN_EMAIL,
            query: query,  // Google Admin SDK query format
            maxResults: 100,
            orderBy: 'email',
        });

        const users = response.data.users || [];
        console.log(`Found ${users.length} matching users`);
        return users;

    } catch (error) {
        handleGoogleAPIError(error, `searchUsers (${query})`);
    }
}

// Add to exports
module.exports = {
    listAllUsers,
    createUser,
    // ... other functions
    searchUsers  // Add new function
};
```

#### Step 2: Create Controller Function

**File:** `src/api/v1/controllers/adminController.v1.js`

```javascript
async function searchUsersController(req, res) {
    try {
        const { query } = req.body;
        console.log('Search query:', query);

        // Validate input
        if (!query) {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        // Call service
        const users = await googleAdminService.searchUsers(query);

        // Return results
        console.log(`${users.length} users found`);
        res.status(200).json(users);

    } catch (error) {
        console.error('Controller searchUsersController error:', error.message);
        res.status(500).json({
            message: 'Search users error',
            error: error.message
        });
    }
}

// Add to exports
module.exports = {
    listAllUsersController,
    createNewUserController,
    // ... other functions
    searchUsersController  // Add new controller
};
```

#### Step 3: Add Route

**File:** `src/api/v1/routes/userRoutes.v1.js`

```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.v1');

router.get('/', (req, res) => {res.status(200).send('User route is working!');});

router.post('/email-list', adminController.listAllUsersController)
router.post('/email-create', adminController.createNewUserController)
router.post('/email-disable', adminController.suspendUserController)
router.post('/email-enable', adminController.reactivateUserController)
router.post('/email-infos', adminController.getUserInfosController)
router.post('/email-password-reset', adminController.resetUserPasswordController)
router.post('/email-search', adminController.searchUsersController)  // Add new route

module.exports = router;
```

#### Step 4: Test the Endpoint

```bash
# Test with curl
curl -X POST http://localhost:3000/api/v1/users/email-search \
  -H "Content-Type: application/json" \
  -d '{"query": "john"}'

# Expected: Array of users matching "john"
```

#### Step 5: Update Documentation

Add the new endpoint to `docs/API_DOCUMENTATION.md`:

```markdown
#### Search Users

Search for users by email or name.

**Endpoint:** `POST /api/v1/users/email-search`

**Request Body:**
```json
{
  "query": "john"
}
```

**Response:** Array of matching users
```

---

## Testing

### Manual Testing

#### Using cURL

```bash
# Test user creation
curl -X POST http://localhost:3000/api/v1/users/email-create \
  -H "Content-Type: application/json" \
  -d '{
    "primaryEmail": "test@domain.com",
    "password": "TempPass123!",
    "givenName": "Test",
    "familyName": "User",
    "orgUnitPath": "/",
    "changePasswordAtNextLogin": "true"
  }'

# Test user listing
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'

# Test password reset
curl -X POST http://localhost:3000/api/v1/users/email-password-reset \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "test@domain.com"}'
```

#### Using Postman

1. Import the Postman collection from `docs/API_DOCUMENTATION.md`
2. Set `baseUrl` variable to `http://localhost:3000`
3. Test each endpoint
4. Save responses for documentation

### Automated Testing (Future Enhancement)

#### Unit Tests with Jest

**Install dependencies:**
```bash
npm install --save-dev jest supertest
```

**Example test** (`tests/controllers/adminController.test.js`):
```javascript
const request = require('supertest');
const app = require('../../app');

describe('Admin Controller', () => {
  describe('POST /api/v1/users/email-list', () => {
    it('should return array of users', async () => {
      const response = await request(app)
        .post('/api/v1/users/email-list')
        .send({});

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/users/email-create', () => {
    it('should create new user', async () => {
      const userData = {
        primaryEmail: 'test@domain.com',
        password: 'TempPass123!',
        givenName: 'Test',
        familyName: 'User',
        orgUnitPath: '/',
        changePasswordAtNextLogin: 'true'
      };

      const response = await request(app)
        .post('/api/v1/users/email-create')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.primaryEmail).toBe(userData.primaryEmail);
    });

    it('should return 400 if missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/email-create')
        .send({ primaryEmail: 'test@domain.com' });

      expect(response.status).toBe(500); // Will be 400 after validation
    });
  });
});
```

**Run tests:**
```bash
npm test
```

---

## Debugging

### Console Logging

```javascript
// Add descriptive console logs
console.log('--- OPERATION START ---');
console.log('Input:', userData);
console.log('Processing...');
console.log('Result:', result);
console.log('--- OPERATION END ---');

// Log errors with context
console.error('Error in createUser:', {
  operation: 'createUser',
  input: userData,
  error: error.message,
  stack: error.stack
});
```

### VS Code Debugger

**Launch configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server.js",
      "envFile": "${workspaceFolder}/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

**Usage:**
1. Set breakpoints by clicking left of line numbers
2. Press F5 to start debugging
3. Use Debug Console to inspect variables

### Docker Debugging

```bash
# View container logs
docker compose logs -f

# Execute commands in container
docker compose exec middleware-google sh

# Inside container:
# Check environment variables
env | grep ADMIN

# Check files
ls -la

# Test internal connectivity
wget http://localhost:3000/

# Exit container
exit
```

### Network Debugging

```bash
# Check if port is listening
lsof -i :3000

# Test from another terminal
curl -v http://localhost:3000/

# Check DNS resolution (if using domain name)
nslookup yourdomain.com

# Test Google API connectivity
curl https://www.googleapis.com/
```

---

## Git Workflow

### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/user-search
git checkout -b feature/add-logging

# Bug fix branches
git checkout -b fix/password-validation
git checkout -b fix/error-handling

# Enhancement branches
git checkout -b enhancement/improve-logging
git checkout -b enhancement/add-retry-logic

# Documentation branches
git checkout -b docs/api-reference
git checkout -b docs/setup-guide
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, etc.)
refactor: Code refactoring
test:     Adding tests
chore:    Maintenance tasks

# Examples
git commit -m "feat(users): add user search endpoint"
git commit -m "fix(auth): correct domain-wide delegation scope"
git commit -m "docs(api): update API documentation with search endpoint"
git commit -m "refactor(service): extract error handling to helper function"
git commit -m "test(controllers): add unit tests for admin controller"
git commit -m "chore(deps): update googleapis to v154.1.0"

# With body
git commit -m "feat(users): add user search endpoint

Implemented new endpoint to search users by email or name.
Uses Google Admin SDK query parameter.
Returns up to 100 matching results.

Closes #42"
```

### Pull Request Process

1. **Create PR** with descriptive title
2. **Fill out template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Manual testing performed
   - [ ] All existing features still work

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review performed
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   ```

3. **Request reviews** from team members
4. **Address feedback** and push changes
5. **Merge** when approved
6. **Delete branch** after merge

---

## Best Practices

### Security

```javascript
// 1. Never log sensitive data
console.log('User data:', { email, name }); // Good
console.log('User data:', { email, password }); // Bad

// 2. Validate all inputs
if (!userEmail || typeof userEmail !== 'string') {
  throw new Error('Invalid email');
}

// 3. Use environment variables for secrets
const apiKey = process.env.API_KEY; // Good
const apiKey = 'hardcoded-key-123'; // Bad

// 4. Handle errors without exposing internals
res.status(500).json({ message: 'Operation failed' }); // Good
res.status(500).json({ message: error.stack }); // Bad
```

### Performance

```javascript
// 1. Avoid unnecessary API calls
// Cache frequently accessed data
const cachedUsers = await getCachedUsers();
if (cachedUsers) return cachedUsers;

// 2. Use appropriate timeout values
const admin = google.admin({
  timeout: 30000, // 30 seconds
  retry: true
});

// 3. Limit result sets
const response = await admin.users.list({
  maxResults: 500 // Don't fetch unlimited
});
```

### Code Quality

```javascript
// 1. Keep functions small and focused
// Good
async function createUser(userData) {
  validateUserData(userData);
  const user = await insertUser(userData);
  await sendWelcomeEmail(user);
  return user;
}

// 2. Use descriptive variable names
const userEmailAddress = req.body.email; // Good
const e = req.body.email; // Bad

// 3. Avoid magic numbers
const MAX_RETRY_ATTEMPTS = 3; // Good
if (attempts > 3) { ... } // Bad

// 4. Handle edge cases
if (!users || users.length === 0) {
  return [];
}
```

### Documentation

```javascript
// 1. Document all exported functions
/**
 * Description
 * @param {Type} paramName - Description
 * @returns {Type} Description
 */

// 2. Update API docs when adding endpoints

// 3. Add inline comments for complex logic

// 4. Keep README up to date
```

---

## Code Review Guidelines

### For Authors

**Before requesting review:**
- [ ] Code follows style guide
- [ ] All functions documented
- [ ] Tested manually
- [ ] No console.log debugging statements
- [ ] No commented-out code
- [ ] Updated relevant documentation
- [ ] Descriptive commit messages
- [ ] PR description filled out

### For Reviewers

**Review checklist:**
- [ ] Code is readable and maintainable
- [ ] Logic is correct
- [ ] Error handling is appropriate
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No unnecessary dependencies

**Review comments:**
```
# Be constructive
"Consider extracting this logic into a separate function for reusability"

# Not just critical
"Nice error handling here!"

# Ask questions
"Could you explain why this approach was chosen over X?"

# Suggest alternatives
"What about using async/await instead of .then()?"
```

---

## Useful Commands

```bash
# Development
npm run dev                  # Start with auto-reload
npm start                    # Start without auto-reload
node server.js              # Direct start

# Docker
docker compose up -d        # Start in background
docker compose down         # Stop containers
docker compose logs -f      # View logs
docker compose restart      # Restart containers
docker compose build        # Rebuild image

# Git
git status                  # Check status
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin branch      # Push to remote
git pull origin master      # Pull latest changes

# Dependencies
npm install                 # Install all dependencies
npm install package         # Install specific package
npm update                  # Update dependencies
npm audit                   # Check for vulnerabilities
npm audit fix              # Fix vulnerabilities

# Debugging
node --inspect server.js    # Start with debugger
lsof -i :3000              # Check port usage
curl http://localhost:3000/ # Test endpoint
```

---

## Resources

### Official Documentation
- [Express.js](https://expressjs.com/)
- [Google Admin SDK](https://developers.google.com/admin-sdk)
- [Node.js](https://nodejs.org/docs/)
- [Docker](https://docs.docker.com/)

### Learning Resources
- [JavaScript Modern Syntax](https://javascript.info/)
- [Async/Await Guide](https://javascript.info/async-await)
- [REST API Best Practices](https://restfulapi.net/)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Document Version:** 1.0.0
**Last Updated:** November 26, 2025
