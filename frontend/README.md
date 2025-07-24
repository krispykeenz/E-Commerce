# E-Commerce Platform Frontend

Angular-based frontend for the e-commerce platform built with Angular 16.

## Features

- **Authentication**: JWT-based authentication with login, register, and session management
- **Product Management**: Browse, search, filter, and view products with reviews
- **Shopping Cart**: Add, update, remove items with persistent cart state
- **Order Management**: Create orders, track status, view order history
- **Payment Processing**: Stripe integration for secure payments
- **Responsive Design**: Bootstrap 5 with mobile-first approach

## Architecture

### Core Services

- **AuthService**: Handle user authentication and JWT management
- **ProductService**: Product CRUD operations and search functionality
- **CartService**: Shopping cart state management
- **OrderService**: Order processing and tracking
- **PaymentService**: Stripe payment integration

### Models & Interfaces

- **User Model**: User profile, addresses, authentication data
- **Product Model**: Product details, reviews, categories
- **Cart Model**: Cart items, quantities, pricing
- **Order Model**: Order details, status, shipping information

### HTTP Interceptors

- **AuthInterceptor**: Automatically adds JWT tokens to API requests and handles 401 errors

## Technology Stack

- **Angular 16**: Frontend framework
- **Bootstrap 5**: UI component library
- **Bootstrap Icons**: Icon library
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe JavaScript
- **Stripe.js**: Payment processing

## Environment Configuration

### Development
- API URL: `http://localhost:3000/api`
- Stripe Key: Test publishable key

### Production
- API URL: Production backend URL
- Stripe Key: Live publishable key

## Commands

### Development
```bash
npm start           # Start development server (ng serve)
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Run linting
```

### Key Dependencies

- `@angular/core` - Angular framework
- `@ng-bootstrap/ng-bootstrap` - Bootstrap components for Angular
- `@stripe/stripe-js` - Stripe payment processing
- `bootstrap` - CSS framework
- `bootstrap-icons` - Icon library

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # Business logic services
│   ├── models/             # TypeScript interfaces
│   ├── interceptors/       # HTTP interceptors
│   ├── guards/             # Route guards
│   └── shared/             # Shared utilities
├── environments/           # Environment configurations
├── assets/                 # Static assets
└── styles.scss            # Global styles
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update environment configuration in `src/environments/`

3. Start development server:
   ```bash
   npm start
   ```

4. Navigate to `http://localhost:4200/`

## API Integration

The frontend expects a RESTful API with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/products` - Get products with filtering
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add items to cart
- `POST /api/orders` - Create new order
- `POST /api/payments/create-intent` - Create Stripe payment intent

## Development Notes

- All services use proper TypeScript typing
- HTTP errors are handled gracefully with user-friendly messages
- Authentication state is managed reactively with BehaviorSubjects
- Cart state persists across sessions for authenticated users
- Payment processing uses Stripe Elements for secure card handling

## Build Configuration

The project is configured with:
- Bootstrap CSS and JS integration
- Bootstrap Icons font loading
- Source maps for development
- Production optimizations with tree-shaking
- Bundle size monitoring with warnings
