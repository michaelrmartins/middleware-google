# 🚀 Google API Middleware

A powerful and lightweight Node.js middleware service for managing Google Workspace user accounts through the Google Admin SDK API. Built with Express.js, Docker, and the official Google APIs client library.

## ✨ Features

- **User Email Management**: Complete CRUD operations for Google Workspace user accounts
- **Secure API**: RESTful API endpoints with proper error handling
- **Docker Ready**: Fully containerized with Docker and Docker Compose
- **Production Ready**: Built with Node.js 24 and optimized for performance
- **Modular Architecture**: Clean separation of concerns with controllers, services, and routes

## 🏗️ Architecture

![Flow 1 Diagram](docs/img/flow-1.png)


```
middleware-google/
├── app.js                          # Application configuration
├── server.js                       # Server entry point
├── src/
│   ├── api/v1/                     # API version 1
│   │   ├── controllers/            # Request handlers
│   │   │   ├── adminController.v1.js
│   │   │   └── googleTestController.v1.js
│   │   └── routes/                 # Route definitions
│   │       ├── index.v1.js
│   │       ├── userRoutes.v1.js
│   │       └── googleTestRoutes.v1.js
│   ├── services/                   # Business logic layer
│   │   ├── googleAdminService.js
│   │   └── googleTestService.js
│   └── utils/                      # Utility functions
│       └── passwordGenerator.js
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Docker image definition
└── package.json                    # Project dependencies
```

## 🔌 API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users/email-list` | Retrieve all email accounts from root domain |
| `POST` | `/api/v1/users/email-create` | Create a new user email account |
| `PATCH` | `/api/v1/users/email-disable` | Disable an existing email account |
| `PATCH` | `/api/v1/users/email-enable` | Enable a disabled email account |
| `POST` | `/api/v1/users/email-password-reset` | Reset user password with temporary credentials |

### API Response Format

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Workspace Admin account
- Google Cloud Console project with Admin SDK API enabled
- Service account credentials with domain-wide delegation

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/middleware-google.git
cd middleware-google
```

2. Create a `.env` file in the root directory:
```env
# Google API Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_DOMAIN=yourdomain.com
GOOGLE_ADMIN_EMAIL=admin@yourdomain.com

# Application Configuration
PORT=3000
NODE_ENV=development
```

3. Start the application with Docker:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### Local Development

If you prefer to run without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📝 API Usage Examples

### List All Users
```bash
curl -X GET http://localhost:3000/api/v1/users/email-list
```

### Create New User
```bash
curl -X POST http://localhost:3000/api/v1/users/email-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@yourdomain.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Disable User Account
```bash
curl -X PATCH http://localhost:3000/api/v1/users/email-disable \
  -H "Content-Type: application/json" \
  -d '{"email": "user@yourdomain.com"}'
```

### Enable User Account
```bash
curl -X PATCH http://localhost:3000/api/v1/users/email-enable \
  -H "Content-Type: application/json" \
  -d '{"email": "user@yourdomain.com"}'
```

### Reset User Password
```bash
curl -X POST http://localhost:3000/api/v1/users/email-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@yourdomain.com"}'
```

## 🔧 Configuration

### Google Service Account Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Admin SDK API
4. Create a service account with domain-wide delegation
5. Download the service account key file
6. In Google Workspace Admin Console, authorize the service account

### Required Google API Scopes

The service account needs the following OAuth scopes:
- `https://www.googleapis.com/auth/admin.directory.user`
- `https://www.googleapis.com/auth/admin.directory.user.security`

## 🛠️ Development

### Project Structure Explained

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and Google API interactions  
- **Routes**: Define API endpoints and middleware
- **Utils**: Shared utility functions and helpers

### Adding New Features

1. Create controller in `src/api/v1/controllers/`
2. Implement service logic in `src/services/`
3. Define routes in `src/api/v1/routes/`
4. Update the main routes index file

## 🐳 Docker

The application is fully containerized for easy deployment:

```bash
# Build the image
docker build -t middleware-google .

# Run with Docker Compose (recommended)
docker-compose up -d

# Run standalone container
docker run -p 3000:3000 --env-file .env middleware-google
```

## 📊 Health Check

Check if the service is running:
```bash
curl http://localhost:3000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/middleware-google/issues) page
2. Create a new issue with detailed information
3. Include logs and configuration details (without sensitive data)

## 🙏 Acknowledgments

- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Express.js](https://expressjs.com/)
- [Docker](https://www.docker.com/)

---

Made with ❤️ by Mike for Google Workspace automation