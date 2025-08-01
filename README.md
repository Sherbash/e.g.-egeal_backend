# Marshall Backend

A robust backend API for the Neural Nexus team, built with Node.js, Express.js, TypeScript, and MongoDB. This API provides comprehensive user management, subscription handling, and payment processing capabilities with Stripe integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (USER, ADMIN, SUPER_ADMIN)
- **User Management**: Complete user registration, and profile management with image upload
- **Subscription System**: Flexible subscription plans with Stripe payment integration
- **Payment Processing**: Secure payment handling with Stripe webhooks and checkout sessions
- **File Upload**: Image upload functionality with Cloudinary integration
- **Email Services**: Automated email notifications using Node mailer and gmail for verification and password reset
- **Database Management**: MongoDB with Mongoose for type-safe database operations
- **Error Handling**: Comprehensive error handling with custom error classes and validation
- **Security**: Password hashing with bcrypt, JWT tokens, request validation, and CORS configuration
- **Super Admin Seeding**: Automatic super admin creation on application startup

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer and Gmail
- **Validation**: Zod for request validation
- **Development**: ts-node-dev, ESLint

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm package manager
- Stripe account for payment processing
- Cloudinary account for file uploads
- Gmail account for email services

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SMTech24-official/marshall8888_backend_Neuro_Night_AI.git
   cd /marshall8888_backend_Neuro_Night_AI

2. Installation library

```bash
npm installation
```

3. Add .env file at the root 
Follow .env.example file 

4. Run locally
```bash
npm run start:dev
```

5. Build the project
```bash
npm run build 
```

6. Start project
```bash
npm start 
```
