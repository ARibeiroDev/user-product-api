# Store API

A RESTful API for user authentication and product management, built with **Express**, **MongoDB**, and **TypeScript**. This API includes features such as email verification, password reset, JWT-based authentication, and product management.

## Features

### User Authentication

- Register with email verification
- Login with JWT access and refresh tokens (cookies)
- Logout and token revocation
- Forgot Password flow with secure token
- Reset Password with token verification
- Resend Verification Email if needed

### Products

- Create, read, update, and delete products
- Each product includes: name, description, price, stock, category, SKU, and images
- Slugified URLs for product names

### Security

- Passwords hashed using **bcrypt**
- JWT tokens for authentication
- Secure cookies with `httpOnly` and `sameSite` attributes
- Email verification for account activation

### Utilities

- Centralized error handling via middleware
- Async route handler wrapper for cleaner code
- Email sending via Resend API
- Swagger documentation for API exploration

## Environment Variables

Create a `.env` file with the following:

- PORT=3500
- MONGO_URI=<your_mongo_connection_string>
- CLIENT_URL=<your_frontend_url>
- RESEND_API_KEY=<your_resend_api_key>
- EMAIL_FROM=<your_verified_email>
- ACCESS_TOKEN_SECRET=<your_jwt_access_secret>
- REFRESH_TOKEN_SECRET=<your_jwt_refresh_secret>
- NODE_ENV=development

## Running Tests

Tests are implemented with **Vitest**. To run:

`npm test`

Tests use a local MongoDB connection and will clear test collections before and after running.

## Live Demo

Available at:

[Live Demo](https://store-user-product-api.onrender.com/)

## Endpoints Overview

### User Authentication

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | /auth/register            | Create a new user                |
| POST   | /auth/login               | Login with email/username        |
| POST   | /auth/logout              | Logout user (invalidate refresh) |
| POST   | /auth/forgot-password     | Request password reset email     |
| POST   | /auth/reset-password      | Reset password with token        |
| GET    | /auth/verify-email        | Verify email via token           |
| POST   | /auth/resend-verification | Resend verification email        |
| POST   | /auth/refresh             | Refresh access token via cookie  |

### Products

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | /products       | List all products    |
| GET    | /products/:slug | Get product by slug  |
| POST   | /products       | Create new product   |
| PATCH  | /products/:id   | Update product by ID |
| DELETE | /products/:id   | Delete product by ID |

### Users

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| GET    | /users           | List all users             |
| GET    | /users/:id       | Get user by id             |
| PATCH  | /users/me        | Update own profile         |
| PATCH  | /users/:id/admin | Update user role or status |
| DELETE | /users/:id       | Delete a user              |

## License

MIT License
