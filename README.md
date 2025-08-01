
# Marshall Backend

A robust backend API for Neural Nexus team built with Node.js, Express.js, TypeScript, and PostgreSQL. This API provides comprehensive user management, subscription handling, and payment processing capabilities with Stripe integration.

## 🚀 Features

- *Authentication & Authorization*: JWT-based authentication with role-based access control (USER, ADMIN, SUPER_ADMIN)
- *User Management*: Complete user registration, email verification, profile management with image upload
- *Subscription System*: Flexible subscription plans with Stripe payment integration
- *Payment Processing*: Secure payment handling with Stripe webhooks and checkout sessions
- *File Upload*: Image upload functionality with Cloudinary integration
- *Email Services*: Automated email notifications using Brevo SMTP for verification and password reset
- *Database Management*: PostgreSQL with Prisma ORM for type-safe database operations
- *Error Handling*: Comprehensive error handling with custom error classes and validation
- *Security*: Password hashing with bcrypt, JWT tokens, request validation, and CORS configuration
- *Super Admin Seeding*: Automatic super admin creation on application startup

## 🛠 Tech Stack

- *Runtime*: Node.js with TypeScript
- *Framework*: Express.js
- *Database*: Mongodb 
- *ORM*: Mongoose 
- *Authentication*: JWT (JSON Web Tokens)
- *Payment*: Stripe
- *File Storage*: Cloudinary
- *Email Service*: Brevo (formerly Sendinblue) SMTP
- *Validation*: Zod for request validation
- *Development*: ts-node-dev, ESLint

## 📋 Prerequisites

- Node.js (v16 or higher)
- Mongodb database
- Yarn package manager
- Stripe account for payment processing
- Cloudinary account for file uploads
- Brevo (formerly Sendinblue) account for email services

## ⚙️ Installation

1. *Clone the repository*

   ```bash
   git clone https://github.com/smhasanjamil/marshall-server
   cd marshall-server
   ```

2. *Install dependencies*


   ```bash
   npm install
   ```

3. *Set up environment variables*

   Create a .env file in the root directory:

   env




   # Database
   
BACKEND_URL="http://localhost:5300/api/v1"

CLIENT_URL="http://localhost:3300"

CLIENT_URL="https://egeal-ai-hub-frontend.vercel.app"

   # Server Configuration

   NODE_ENV=development

   PORT=5005

   HOST=localhost

   # Port

PORT=5000

# Bcrypt Salt Rounds

BCRYPT_SALT_ROUNDS=12

# JWT Secrets and Expiry

JWT_ACCESS_SECRET=""
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=""
JWT_REFRESH_EXPIRES_IN=1y
JWT_OTP_SECRET=""
JWT_PASS_RESET_SECRET=""
JWT_PASS_RESET_EXPIRES_IN=15m

# Cloudinary Credentials

CLOUDINARY_CLOUD_NAME="<your_cloudinary_cloud_name>"
CLOUDINARY_API_KEY="<your_cloudinary_api_key>"
CLOUDINARY_API_SECRET="<your_cloudinary_api_secret>"

# Email Configuration

SENDER_EMAIL="<your_email>"
SENDER_APP_PASS="<your_app_password>"

#Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51OffGAIRUCEbGACxkfjFRB04GIEjIpRjE3PD4p0kSnFvI9vgCJEegnexMEEIv08VquFOWeiXFoIJrOvT2rOqin6U003qYloLHo
STRIPE_WEBHOOK_SECRET=whsec_CHkgLNIOk3OBATmUIrDNj0w97UOwZB0B

GMAIL_USER=smhasanjamil2025@gmail.com
GMAIL_PASS=oyfo bhdo axaj sxpk

   # URL Configuration

   BACKEND_URL=http://localhost:5000/api/v1
   IMAGE_URL=http://localhost:5005
   FRONTEND_URL=http://localhost:3000
   

4. *Set up the database*

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

bash
npm run  build
npm  start


### Using Docker

```bash
docker-compose up -d
```

The server will start on http://localhost:5005

## 📁 Project Structure


src/
├── app/
│   ├── builder/          # Query builder utilities
│   ├── config/           # Configuration files
│   ├── errors/           # Error handling utilities
│   ├── helpers/          # Helper functions (password, JWT, OTP)
│   ├── interface/        # TypeScript interfaces
│   ├── middlewares/      # Express middlewares
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication module
│   │   ├── plan/         # Subscription plans module
│   │   ├── subscription/ # Subscription management
│   │   └── user/         # User management
│   ├── routes/           # Route definitions
│   └── utils/            # Utility functions
├── prisma/               # Database schema and migrations
├── uploads/              # File upload directory
└── views/                # View templates


## 🔗 API Endpoints

### Authentication

- POST /api/v1/auth/login - User login
- POST /api/v1/user - User create


### Users

- POST /api/v1/user - User registration
- GET /api/v1/user - Get all users (Admin/Super Admin only)
- GET /api/v1/users/:userId - Get user by ID (Admin/Super Admin only)
- PATCH /api/v1/users/update - Update user profile with file upload
- DELETE /api/v1/users/:userId - Delete user (Admin/Super Admin only)
  
### Tools

- POST /api/v1/tools - create tools 
- GET /api/v1/tools - Get all tools
- GET /api/v1/tools/:id - Get tools
- 
### Afflite

- POST /api/v1/affiliates - create affiliates
- GET /api/v1/affiliates - Get all affiliates
- GET /api/v1/affiliates/:id - Get affiliates

### payment

- POST /api/v1/payment/create-checkout-session
- GET /api/v1/payment/confirm? - Get all payment 


### giveaway

- POST /api/v1/giveaway/create-giveaway
- GET /api/v1/giveaway
- GET /api/v1/giveaway/:id
- GET /api/v1/giveaway/ongoing-giveaways
- GET /api/v1/giveaway/current-giveaways

- 
### participant

- POST /api/v1/participant - create participant
- GET /api/v1/participant - Get all participant
- GET /api/v1/participant/:id -ge singe participant

### promotion

- POST /api/v1/promotion - create promotion
- GET /api/v1/promotion - Get all promotion
- GET /api/v1/promotion/:id Get promotion 
- PATCH /api/v1/promotion/update promaio 
- DELETE /api/v1/promotion/:userId - Delete promation
- 
### chat 

- POST /api/v1/chat -chat create frist time 
- GET /api/v1/chat - Get all chat 
- post /api/v1/chat/:chatId /messages - create message



## 🗃️ Database Schema

### User Model

- User authentication and profile information
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Email verification and password reset functionality

## 🔒 Authentication & Authorization

The API uses JWT-based authentication with robust security measures:

### *Token Security*

- *Dual Token System*: Separate access and refresh tokens with different secret keys
- *Token Expiration*:
  - Access tokens: 2 years (configurable)
  - Refresh tokens: 5 years (configurable)
  - Password reset tokens: 5 minutes (short-lived for security)
- *Token Validation*: Secure token verification on every protected route
- *Automatic Invalidation*: Tokens become invalid when passwords are changed

### *Role-Based Access Control*

- *user*: Regular users with basic access to personal data and subscriptions
- *admin*: Administrative users with extended permissions for user and plan management
- *influencer*: Administrative users with extended permissions for user and plan management
- *founder*: Full system access including all administrative functions
- *investor*: Full system access including all administrative functions

### *Authentication Flow*

Protected routes require a valid JWT token in the Authorization header:


Authorization: Bearer <your-jwt-token>


## 💳 Payment Integration

The application integrates with Stripe for payment processing:

- bay product and management
- Secure payment processing
- Webhook handling for payment events

## 📧 Email Services

- *Email Provider*: Brevo (formerly Sendinblue) SMTP service
- *Email Verification*: Automated email verification for new user registration
- *Template System*: HTML email templates with branded design
- *Time Limits*: Email verification and password reset links expire in 10 minutes for security

## 🛡️ Security Features

- *Password Security*: Bcrypt hashing with salt rounds for secure password storage
- *JWT Token Security*:
  - Separate access and refresh tokens with different secret keys
  - Configurable token expiration (Access: 2 years, Refresh: 5 years, Reset: 5 minutes)
  - Secure token generation and validation
  - Token-based authentication for all protected routes
  - Password change invalidates existing tokens
- *Request Validation*: Zod schema validation for all incoming requests
- *CORS Configuration*: Configured for specific frontend origins with credentials support
- *Role-Based Access*: Three-tier role system (USER, ADMIN, SUPER_ADMIN)
- *File Upload Security*: Secure file handling with Cloudinary integration
- *Email Security*: Time-limited verification and reset links (10-minute expiration)
- *Error Handling*: Comprehensive error handling without exposing sensitive information

## 🧪 Development

### Code Style

The project uses ESLint and TypeScript for code quality and type safety.

### Database Management

Use Prisma Studio to manage your database:

bash
npx prisma studio


### Debugging

The application includes comprehensive error handling and logging for debugging purposes.

## License

This project is licensed under the MIT License.

