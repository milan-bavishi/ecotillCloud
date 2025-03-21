# EcoSattva Backend API

This is the backend server for the EcoSattva application, providing RESTful API endpoints for authentication, user management, and application-specific functionality.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   NODE_ENV=development
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password-request` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change user password

## Directory Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Middleware functions
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── index.js       # Entry point
├── .env               # Environment variables (not in repo)
├── .gitignore         # Git ignore file
├── package.json       # Package configuration
└── README.md          # This file
``` 