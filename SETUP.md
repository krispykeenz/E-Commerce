# E-Commerce Platform Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Angular CLI (v16+)
- Stripe account for payment processing

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   NODE_ENV=development
   CLIENT_URL=http://localhost:4200
   ```

4. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the backend server:**
   ```bash
   npm run dev
   ```
   Server will start on http://localhost:5000

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Configuration:**
   Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api',
     stripePublishableKey: 'pk_test_your_stripe_publishable_key'
   };
   ```

4. **Start the Angular development server:**
   ```bash
   ng serve
   ```
   Application will be available at http://localhost:4200

## Stripe Configuration

1. **Create a Stripe account** at https://stripe.com
2. **Get API keys** from Stripe Dashboard > Developers > API keys
3. **Set up webhook endpoint** (for production):
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Database Initialization

The application will automatically create collections when you start using it. For testing, you can create an admin user:

1. Register a user through the frontend
2. In MongoDB, update the user's role to 'admin':
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Default Admin Account

You can create a default admin account by running this in MongoDB:

```javascript
// Create admin user
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLnOcIzV.Y0Wja", // password: admin123
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
ng test
```

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB instance
3. Set up proper CORS configuration
4. Use HTTPS for secure payment processing
5. Configure proper error logging

### Frontend Deployment
1. Build the production bundle:
   ```bash
   ng build --prod
   ```
2. Deploy the `dist/` folder to your web server
3. Configure environment variables for production API URLs

## Features Overview

### Customer Features
- User registration and authentication
- Product browsing with search and filters
- Shopping cart management
- Secure checkout with Stripe
- Order tracking and history
- User profile management

### Admin Features
- Admin dashboard with analytics
- Product management (CRUD operations)
- Order management and status updates
- User management
- Inventory tracking

### Technical Features
- JWT-based authentication
- Responsive design with Bootstrap
- Real-time cart updates
- Secure payment processing
- RESTful API design
- MongoDB data persistence
- Angular reactive forms
- Type-safe TypeScript throughout

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **Stripe Payment Issues:**
   - Verify API keys are correct
   - Check if webhook endpoint is accessible
   - Ensure HTTPS in production

3. **CORS Errors:**
   - Verify CLIENT_URL in backend .env
   - Check CORS configuration in server.js

4. **Angular Build Errors:**
   - Use `--legacy-peer-deps` flag for npm install
   - Check TypeScript version compatibility

### Environment Variables Checklist

Backend `.env` file must include:
- [x] PORT
- [x] MONGODB_URI
- [x] JWT_SECRET
- [x] JWT_EXPIRE
- [x] STRIPE_SECRET_KEY
- [x] STRIPE_PUBLISHABLE_KEY
- [x] NODE_ENV
- [x] CLIENT_URL

Frontend environment must include:
- [x] apiUrl
- [x] stripePublishableKey

## Support

For issues and questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check API endpoints are accessible

## License

This project is for educational/commercial use. Please ensure you comply with all third-party service terms (Stripe, MongoDB, etc.).
