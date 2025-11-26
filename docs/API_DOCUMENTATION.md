# API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [User Management](#user-management)
  - [Testing & Diagnostics](#testing--diagnostics)

---

## Overview

The Google Workspace Middleware API provides a RESTful interface for managing Google Workspace users through the Google Admin SDK. This API serves as an intermediary layer between your applications and Google's Admin Directory API, simplifying user account operations.

### Key Features
- Complete user lifecycle management (create, read, suspend, reactivate)
- Secure password generation and reset functionality
- User information retrieval
- Domain-wide user listing
- Built-in error handling and logging
- JSON-based request/response format

---

## Base URL

### Development
```
http://localhost:3000
```

### Production
```
https://your-domain.com
```

All API endpoints are versioned and prefixed with `/api/v1`.

---

## Authentication

This middleware uses **Google Service Account authentication** with domain-wide delegation. Individual API requests to this middleware do not require authentication headers (implement your own authentication layer as needed).

### Google Service Account Requirements
- Service account must have domain-wide delegation enabled
- Required OAuth scopes:
  - `https://www.googleapis.com/auth/admin.directory.user`
  - `https://www.googleapis.com/auth/admin.directory.user.readonly`
- Admin email must have appropriate Google Workspace admin privileges

---

## Response Format

### Success Response
All successful API calls return a JSON response with the following structure:

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

### Error Response
Error responses follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    // Detailed error information
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request parameters |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server-side error |

### Common Error Messages

#### Authentication Errors
```json
{
  "message": "Not Authorized listAllUsers. Check Admin SDK for admin@domain.com",
  "error": { "code": 403 }
}
```

#### Validation Errors
```json
{
  "message": "User data is not complete: primaryEmail, password, givenName, familyName, orgUnitPath and changePasswordAtNextLogin are necessary",
  "error": { "code": 400 }
}
```

#### Resource Not Found
```json
{
  "message": "Resource not found for suspendUser: User not found",
  "error": { "code": 404 }
}
```

---

## Rate Limiting

Google Admin SDK has the following quotas:
- **Query Per Second (QPS)**: 20 queries per second per project
- **Daily Quota**: 150,000 requests per day

The middleware implements automatic retry logic for failed requests.

---

## API Endpoints

### Health Check

#### Get Root
Check if the API is running.

**Endpoint:** `GET /`

**Response:**
```
Google API - Home
```

**Example:**
```bash
curl http://localhost:3000/
```

---

### User Management

All user management endpoints are under `/api/v1/users`.

#### Check User Routes
Verify user routes are operational.

**Endpoint:** `GET /api/v1/users/`

**Response:**
```
User route is working!
```

**Example:**
```bash
curl http://localhost:3000/api/v1/users/
```

---

#### List All Users

Retrieve all users from the Google Workspace domain.

**Endpoint:** `POST /api/v1/users/email-list`

**Request Body:**
```json
{}
```

**Response:**
```json
[
  {
    "kind": "admin#directory#user",
    "id": "118234567890123456789",
    "etag": "\"abcd1234efgh5678\"",
    "primaryEmail": "john.doe@domain.com",
    "name": {
      "givenName": "John",
      "familyName": "Doe",
      "fullName": "John Doe"
    },
    "isAdmin": false,
    "isDelegatedAdmin": false,
    "lastLoginTime": "2025-11-26T08:30:00.000Z",
    "creationTime": "2025-01-15T10:00:00.000Z",
    "agreedToTerms": true,
    "suspended": false,
    "archived": false,
    "changePasswordAtNextLogin": false,
    "ipWhitelisted": false,
    "emails": [
      {
        "address": "john.doe@domain.com",
        "primary": true
      }
    ],
    "customerId": "C01234567",
    "orgUnitPath": "/",
    "isMailboxSetup": true,
    "isEnrolledIn2Sv": false,
    "isEnforcedIn2Sv": false,
    "includeInGlobalAddressList": true,
    "recoveryEmail": "john.personal@gmail.com"
  }
]
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `primaryEmail` | string | User's primary email address |
| `name.givenName` | string | First name |
| `name.familyName` | string | Last name |
| `name.fullName` | string | Full name |
| `isAdmin` | boolean | Whether user has admin privileges |
| `suspended` | boolean | Whether account is suspended |
| `lastLoginTime` | string (ISO 8601) | Last login timestamp |
| `creationTime` | string (ISO 8601) | Account creation timestamp |
| `orgUnitPath` | string | Organizational unit path |
| `isEnrolledIn2Sv` | boolean | Two-step verification enrolled |

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-list \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Parameters:**
- Maximum results: 500 users
- Ordered by: email (ascending)
- Domain: Configured in environment variables

**Error Scenarios:**
- `403`: Domain-wide delegation not configured
- `500`: Google API connection error

---

#### Create New User

Create a new Google Workspace user account.

**Endpoint:** `POST /api/v1/users/email-create`

**Request Body:**
```json
{
  "primaryEmail": "jane.smith@domain.com",
  "password": "SecureP@ssw0rd123",
  "givenName": "Jane",
  "familyName": "Smith",
  "orgUnitPath": "/",
  "changePasswordAtNextLogin": "true"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `primaryEmail` | string | Yes | User's email address (must be in domain) |
| `password` | string | Yes | Initial password (min 8 characters) |
| `givenName` | string | Yes | First name |
| `familyName` | string | Yes | Last name |
| `orgUnitPath` | string | Yes | Organizational unit (e.g., "/", "/Sales", "/Engineering") |
| `changePasswordAtNextLogin` | string/boolean | Yes | Force password change on first login |

**Response:**
```json
{
  "kind": "admin#directory#user",
  "id": "118234567890123456790",
  "etag": "\"xyz789abc123\"",
  "primaryEmail": "jane.smith@domain.com",
  "name": {
    "givenName": "Jane",
    "familyName": "Smith",
    "fullName": "Jane Smith"
  },
  "isAdmin": false,
  "isDelegatedAdmin": false,
  "creationTime": "2025-11-26T10:45:00.000Z",
  "suspended": false,
  "changePasswordAtNextLogin": true,
  "orgUnitPath": "/",
  "customerId": "C01234567"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-create \
  -H "Content-Type: application/json" \
  -d '{
    "primaryEmail": "jane.smith@domain.com",
    "password": "SecureP@ssw0rd123",
    "givenName": "Jane",
    "familyName": "Smith",
    "orgUnitPath": "/",
    "changePasswordAtNextLogin": "true"
  }'
```

**Password Requirements:**
- Minimum 8 characters
- Recommended: Mix of uppercase, lowercase, numbers, and special characters

**Organizational Units:**
- Use `/` for root organization
- Use `/Department/SubDepartment` for nested units
- Must exist in Google Workspace before assignment

**Error Scenarios:**
- `400`: Missing required fields
- `400`: Email already exists
- `400`: Invalid organizational unit path
- `403`: Insufficient permissions
- `500`: User creation failed

**Success Status:** `201 Created`

---

#### Suspend User Account

Disable a user account (user cannot sign in).

**Endpoint:** `POST /api/v1/users/email-disable`

**Request Body:**
```json
{
  "userEmail": "john.doe@domain.com"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userEmail` | string | Yes | Email address of user to suspend |

**Response:**
```json
{
  "message": "User john.doe@domain.com was suspended sucessfully."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-disable \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "john.doe@domain.com"}'
```

**Effects of Suspension:**
- User cannot sign in to Google Workspace
- Email continues to be received (not deleted)
- User data is preserved
- Can be reactivated at any time

**Error Scenarios:**
- `400`: userEmail parameter missing
- `404`: User not found
- `403`: Insufficient permissions to suspend user
- `500`: Suspension operation failed

**Success Status:** `200 OK`

---

#### Reactivate User Account

Re-enable a suspended user account.

**Endpoint:** `POST /api/v1/users/email-enable`

**Request Body:**
```json
{
  "userEmail": "john.doe@domain.com"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userEmail` | string | Yes | Email address of user to reactivate |

**Response:**
```json
{
  "message": "User john.doe@domain.com sucessfully reactivated."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-enable \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "john.doe@domain.com"}'
```

**Effects of Reactivation:**
- User can immediately sign in again
- All previous data and settings restored
- Access to all previously assigned services

**Error Scenarios:**
- `400`: userEmail parameter missing
- `404`: User not found
- `403`: Insufficient permissions
- `500`: Reactivation operation failed

**Success Status:** `200 OK`

---

#### Get User Information

Retrieve detailed information about a specific user.

**Endpoint:** `POST /api/v1/users/email-infos`

**Request Body:**
```json
{
  "userEmail": "john.doe@domain.com"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userEmail` | string | Yes | Email address of user to query |

**Response:**
```json
{
  "kind": "admin#directory#user",
  "id": "118234567890123456789",
  "etag": "\"abcd1234efgh5678\"",
  "primaryEmail": "john.doe@domain.com",
  "name": {
    "givenName": "John",
    "familyName": "Doe",
    "fullName": "John Doe"
  },
  "isAdmin": false,
  "isDelegatedAdmin": false,
  "lastLoginTime": "2025-11-26T08:30:00.000Z",
  "creationTime": "2025-01-15T10:00:00.000Z",
  "agreedToTerms": true,
  "suspended": false,
  "archived": false,
  "changePasswordAtNextLogin": false,
  "ipWhitelisted": false,
  "emails": [
    {
      "address": "john.doe@domain.com",
      "type": "work",
      "customType": "",
      "primary": true
    }
  ],
  "addresses": [],
  "externalIds": [],
  "relations": [],
  "aliases": [],
  "nonEditableAliases": [],
  "customerId": "C01234567",
  "orgUnitPath": "/",
  "isMailboxSetup": true,
  "isEnrolledIn2Sv": false,
  "isEnforcedIn2Sv": false,
  "includeInGlobalAddressList": true,
  "thumbnailPhotoUrl": "https://lh3.googleusercontent.com/...",
  "recoveryEmail": "john.personal@gmail.com",
  "recoveryPhone": "+1234567890"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-infos \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "john.doe@domain.com"}'
```

**Use Cases:**
- Verify user account status
- Check last login time
- Retrieve organizational unit
- Verify 2-step verification status
- Get recovery contact information

**Error Scenarios:**
- `400`: userEmail parameter missing
- `404`: User not found
- `403`: Insufficient permissions to view user
- `500`: Query operation failed

**Success Status:** `200 OK`

---

#### Reset User Password

Generate a new random password for a user and force password change at next login.

**Endpoint:** `POST /api/v1/users/email-password-reset`

**Request Body:**
```json
{
  "userEmail": "john.doe@domain.com"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userEmail` | string | Yes | Email address of user whose password to reset |

**Response:**
```json
{
  "message": "Password for user john.doe@domain.com was reset successfully.",
  "newPassword": "aB3$mK9#rT2x"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `newPassword` | string | Generated temporary password (12 characters) |

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/email-password-reset \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "john.doe@domain.com"}'
```

**Password Generation:**
- **Length:** 12 characters
- **Composition:**
  - Lowercase letters (excluded: i, l, n, o, p, q, z for clarity)
  - Uppercase letters (excluded: I, O for clarity)
  - Numbers (excluded: 0, 1 for clarity)
  - Special characters: `*`, `#`, `@`, `$`, `%`, `&`, `?`
- **Guarantee:** At least one character from each category
- **Randomization:** Fisher-Yates shuffle algorithm

**Automatic Actions:**
- Sets `changePasswordAtNextLogin: true`
- User must change password on next sign-in
- Previous password is immediately invalidated

**Security Considerations:**
- Store the returned password securely
- Transmit to user via secure channel (not email)
- Password is only returned once
- Consider implementing your own password reset notification system

**Error Scenarios:**
- `400`: userEmail parameter missing
- `404`: User not found
- `403`: Insufficient permissions
- `500`: Password reset operation failed

**Success Status:** `200 OK`

---

### Testing & Diagnostics

#### Test API Authentication

Verify that the Google Service Account authentication is working correctly.

**Endpoint:** `GET /api/v1/test/whoami`

**Response:**
```json
{
  "resourceName": "people/118234567890123456789",
  "etag": "%abcd1234efgh5678",
  "names": [
    {
      "metadata": {
        "primary": true,
        "source": {
          "type": "PROFILE",
          "id": "118234567890123456789"
        }
      },
      "displayName": "Service Account Name",
      "familyName": "Account",
      "givenName": "Service",
      "displayNameLastFirst": "Account, Service"
    }
  ],
  "emailAddresses": [
    {
      "metadata": {
        "primary": true,
        "verified": true,
        "source": {
          "type": "ACCOUNT",
          "id": "118234567890123456789"
        }
      },
      "value": "service-account@project.iam.gserviceaccount.com"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/test/whoami
```

**Purpose:**
- Verify Google API credentials are valid
- Confirm service account authentication
- Diagnose connection issues

**Error Scenarios:**
- `500`: Invalid credentials
- `500`: Service account not found
- `500`: API scope issues

**Success Status:** `200 OK`

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// List all users
async function listUsers() {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/email-list`);
    console.log(`Found ${response.data.length} users`);
    return response.data;
  } catch (error) {
    console.error('Error listing users:', error.response?.data);
    throw error;
  }
}

// Create a new user
async function createUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/email-create`, {
      primaryEmail: userData.email,
      password: userData.password,
      givenName: userData.firstName,
      familyName: userData.lastName,
      orgUnitPath: userData.orgUnit || '/',
      changePasswordAtNextLogin: 'true'
    });
    console.log('User created:', response.data.primaryEmail);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data);
    throw error;
  }
}

// Reset user password
async function resetPassword(email) {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/email-password-reset`, {
      userEmail: email
    });
    console.log('New password:', response.data.newPassword);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error.response?.data);
    throw error;
  }
}

// Suspend user
async function suspendUser(email) {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/email-disable`, {
      userEmail: email
    });
    console.log(response.data.message);
    return response.data;
  } catch (error) {
    console.error('Error suspending user:', error.response?.data);
    throw error;
  }
}
```

### Python

```python
import requests

API_BASE_URL = 'http://localhost:3000/api/v1'

def list_users():
    """List all domain users"""
    try:
        response = requests.post(f'{API_BASE_URL}/users/email-list')
        response.raise_for_status()
        users = response.json()
        print(f'Found {len(users)} users')
        return users
    except requests.exceptions.RequestException as e:
        print(f'Error listing users: {e}')
        raise

def create_user(email, password, first_name, last_name, org_unit='/'):
    """Create a new user"""
    try:
        payload = {
            'primaryEmail': email,
            'password': password,
            'givenName': first_name,
            'familyName': last_name,
            'orgUnitPath': org_unit,
            'changePasswordAtNextLogin': 'true'
        }
        response = requests.post(f'{API_BASE_URL}/users/email-create', json=payload)
        response.raise_for_status()
        user = response.json()
        print(f'User created: {user["primaryEmail"]}')
        return user
    except requests.exceptions.RequestException as e:
        print(f'Error creating user: {e}')
        raise

def reset_password(email):
    """Reset user password"""
    try:
        payload = {'userEmail': email}
        response = requests.post(f'{API_BASE_URL}/users/email-password-reset', json=payload)
        response.raise_for_status()
        result = response.json()
        print(f'New password: {result["newPassword"]}')
        return result
    except requests.exceptions.RequestException as e:
        print(f'Error resetting password: {e}')
        raise

def get_user_info(email):
    """Get user information"""
    try:
        payload = {'userEmail': email}
        response = requests.post(f'{API_BASE_URL}/users/email-infos', json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error getting user info: {e}')
        raise
```

### cURL

```bash
#!/bin/bash

API_BASE_URL="http://localhost:3000/api/v1"

# List all users
list_users() {
  curl -X POST "${API_BASE_URL}/users/email-list" \
    -H "Content-Type: application/json" \
    -d '{}'
}

# Create a new user
create_user() {
  local email=$1
  local password=$2
  local first_name=$3
  local last_name=$4

  curl -X POST "${API_BASE_URL}/users/email-create" \
    -H "Content-Type: application/json" \
    -d "{
      \"primaryEmail\": \"${email}\",
      \"password\": \"${password}\",
      \"givenName\": \"${first_name}\",
      \"familyName\": \"${last_name}\",
      \"orgUnitPath\": \"/\",
      \"changePasswordAtNextLogin\": \"true\"
    }"
}

# Reset password
reset_password() {
  local email=$1

  curl -X POST "${API_BASE_URL}/users/email-password-reset" \
    -H "Content-Type: application/json" \
    -d "{\"userEmail\": \"${email}\"}"
}

# Suspend user
suspend_user() {
  local email=$1

  curl -X POST "${API_BASE_URL}/users/email-disable" \
    -H "Content-Type: application/json" \
    -d "{\"userEmail\": \"${email}\"}"
}

# Example usage
# list_users
# create_user "test@domain.com" "TempPass123!" "Test" "User"
# reset_password "test@domain.com"
```

---

## Best Practices

### 1. Error Handling
Always implement proper error handling in your client applications:

```javascript
try {
  const result = await createUser(userData);
  // Handle success
} catch (error) {
  if (error.response?.status === 400) {
    // Handle validation error
  } else if (error.response?.status === 403) {
    // Handle permission error
  } else {
    // Handle general error
  }
}
```

### 2. Password Management
- Never log or store passwords in plain text
- Use secure transmission (HTTPS in production)
- Implement additional password complexity requirements if needed
- Always set `changePasswordAtNextLogin: true` for initial passwords

### 3. Rate Limiting
- Implement exponential backoff for retries
- Batch operations when possible
- Monitor Google API quota usage

### 4. Logging
- Log all API operations for audit trails
- Never log sensitive data (passwords, tokens)
- Include timestamps and user context

### 5. Security
- Implement authentication/authorization for this middleware
- Use HTTPS in production
- Restrict network access to trusted sources
- Regularly rotate service account keys

---

## Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Google Workspace Middleware",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "List All Users",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-list",
        "body": {"mode": "raw", "raw": "{}"}
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-create",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"primaryEmail\": \"test@domain.com\",\n  \"password\": \"TempPass123!\",\n  \"givenName\": \"Test\",\n  \"familyName\": \"User\",\n  \"orgUnitPath\": \"/\",\n  \"changePasswordAtNextLogin\": \"true\"\n}"
        }
      }
    },
    {
      "name": "Get User Info",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-infos",
        "body": {"mode": "raw", "raw": "{\"userEmail\": \"test@domain.com\"}"}
      }
    },
    {
      "name": "Reset Password",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-password-reset",
        "body": {"mode": "raw", "raw": "{\"userEmail\": \"test@domain.com\"}"}
      }
    },
    {
      "name": "Suspend User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-disable",
        "body": {"mode": "raw", "raw": "{\"userEmail\": \"test@domain.com\"}"}
      }
    },
    {
      "name": "Reactivate User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{baseUrl}}/api/v1/users/email-enable",
        "body": {"mode": "raw", "raw": "{\"userEmail\": \"test@domain.com\"}"}
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3000"}
  ]
}
```

---

## Changelog

### Version 1.0.0
- Initial API release
- User listing endpoint
- User creation endpoint
- User suspension/reactivation endpoints
- Password reset endpoint
- User information retrieval endpoint
- Service account authentication test endpoint

---

## Support

For issues or questions:
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Google Admin SDK Documentation](https://developers.google.com/admin-sdk)
- Open an issue on GitHub

---

**Last Updated:** November 26, 2025
**API Version:** v1
**Documentation Version:** 1.0.0
