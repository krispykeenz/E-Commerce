# E-Commerce Platform

A comprehensive e-commerce platform built with Angular, Node.js, MongoDB, Stripe API, JWT authentication, and Bootstrap.

## 🚀 Features

### Customer Features
- User registration and authentication with JWT
- Product catalog with advanced search and filtering
- Shopping cart with real-time updates
- Secure checkout with Stripe payment processing
- Order tracking and history
- User profile management
- Responsive design for all devices

### Admin Features
- Admin dashboard with analytics and statistics
- Complete product management (CRUD operations)
- Order management with status updates
- User management with role controls
- Inventory tracking and stock management
- File upload for product images

### Technical Features
- RESTful API architecture
- JWT-based authentication with middleware
- Secure payment processing with Stripe
- Real-time cart synchronization
- Responsive Bootstrap 5 design
- Type-safe TypeScript throughout
- MongoDB data persistence
- Angular reactive forms with validation

## 🛠 Tech Stack

- **Frontend**: Angular 16+ with Bootstrap 5, NgBootstrap
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe API
- **Styling**: Bootstrap 5 + Custom SCSS
- **State Management**: RxJS Observables
- **Form Handling**: Angular Reactive Forms
- **HTTP Client**: Angular HttpClient with Interceptors

## 📁 Project Structure

```
├── backend/
│   ├── models/           # MongoDB models (User, Product, Order, Cart)
│   ├── routes/           # API routes (auth, products, orders, cart, payment)
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Express server setup
├── frontend/
│   ├── src/app/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components (Home, Shop)
│   │   ├── admin/        # Admin dashboard components
│   │   ├── services/     # Angular services
│   │   ├── models/       # TypeScript interfaces
│   │   ├── guards/       # Route guards
│   │   └── interceptors/ # HTTP interceptors
│   └── src/environments/ # Environment configurations
├── SETUP.md              # Detailed setup instructions
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Angular CLI (v16+)
- Stripe account

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with MongoDB URI, JWT secret, and Stripe keys
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
# Update src/environments/environment.ts with your API URL and Stripe key
ng serve
```

### 3. Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:4200/admin (requires admin role)

## 📚 Detailed Setup

For complete setup instructions including environment configuration, database initialization, and deployment guidelines, see [SETUP.md](SETUP.md).

## 🔐 Default Admin Account

After setting up the database, create an admin user:

```javascript
// In MongoDB shell
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

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get products (with filtering, search, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Payments
- `POST /api/payment/create-payment-intent` - Create Stripe payment
- `POST /api/payment/confirm` - Confirm payment

## 🖼 Screenshots

### Customer Interface
- **Homepage**: Featured products, categories, search functionality
- **Product Catalog**: Grid view with filters, sorting, pagination
- **Product Details**: Images, description, reviews, add to cart
- **Shopping Cart**: Item management, quantity updates, totals
- **Checkout**: Secure Stripe payment processing
- **User Profile**: Account management, order history

### Admin Dashboard
- **Overview**: Sales analytics, recent orders, quick stats
- **Product Management**: CRUD operations, inventory tracking
- **Order Management**: Status updates, customer details
- **User Management**: Role controls, account oversight

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Start production server
```

### Frontend Development
```bash
cd frontend
ng serve            # Development server
ng build           # Production build
ng test            # Run unit tests
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a production MongoDB instance
3. Configure HTTPS for Stripe webhooks
4. Set up proper error logging and monitoring

### Frontend Deployment
1. Build for production: `ng build --prod`
2. Deploy `dist/` folder to web server
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For questions and support:
1. Check [SETUP.md](SETUP.md) for detailed instructions
2. Review the API documentation
3. Ensure all environment variables are configured
4. Verify MongoDB and all services are running

## 🎉 Acknowledgments

Built with modern web technologies:
- Angular for robust frontend framework
- Node.js/Express for scalable backend
- MongoDB for flexible data storage
- Stripe for secure payment processing
- Bootstrap for responsive design
