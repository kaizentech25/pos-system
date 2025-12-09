# POS System - MERN Stack

A full-featured Point of Sale (POS) system built with MongoDB, Express, React, and Node.js.

## Features

### 🔐 Authentication
- User login/logout with role-based access (Admin/Cashier)
- Session persistence with localStorage

### 🛒 POS Terminal
- Product search by name, SKU, or barcode
- Shopping cart with quantity management
- Discount application
- VAT calculation (12%)
- Multiple payment methods (Cash, QR Code, Card)
- Real-time stock updates

### 📦 Product Management
- CRUD operations for products
- Category-based organization (Beverages, Snacks, Food, Other)
- Stock tracking with low-stock alerts
- Product search and filtering

### 👥 User Management (Admin Only)
- Create, edit, and delete users
- Role assignment (Admin/Cashier)

### 📊 Reports & Analytics (Admin Only)
- Daily, weekly, and monthly sales reports
- Transaction analytics
- Payment method breakdown
- Top products by revenue
- Sales charts and visualizations
- Category performance tracking

### 📱 Dashboard
- Today's sales overview
- Transaction count
- Low stock alerts
- Active products count
- Quick access to all modules

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
   ```bash
   cd pos-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/pos-system
   PORT=5001
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

   This will create:
   - Admin user: `admin@pos.com` / `password123`
   - Sample products (8 items)

5. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   This starts both backend (port 5001) and frontend (port 5173).

   Or run them separately:
   ```bash
   # Backend only
   cd backend
   npm run dev

   # Frontend only (in another terminal)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users
- `POST /api/auth/users` - Create user
- `PUT /api/auth/users/:id` - Update user
- `DELETE /api/auth/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products (with search & filter)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/low-stock` - Get low stock products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/dashboard` - Get dashboard stats
- `GET /api/transactions/reports` - Get sales reports

## Default Credentials

**Admin Account:**
- Email: `admin@pos.com`
- Password: `password123`

## Project Structure

```
pos-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── upstash.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   └── transactionController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── Transaction.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── middleware/
│   │   │   └── rateLimiter.js
│   │   └── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── PaymentModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── POSTerminalPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── lib/
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── package.json
```

## Usage Guide

### Making a Sale
1. Navigate to **POS Terminal**
2. Search or click on products to add to cart
3. Adjust quantities using +/- buttons
4. Apply discount if needed
5. Click **Pay** button
6. Select payment method
7. Confirm transaction

### Managing Products
1. Navigate to **Products**
2. Click **Add Product** to create new items
3. Edit or delete existing products
4. Use search and category filters

### Viewing Reports
1. Navigate to **Reports** (Admin only)
2. Select time period (Today/Week/Month)
3. View sales analytics, charts, and top products
4. Export reports if needed

### Managing Users
1. Navigate to **Users** (Admin only)
2. Click **Add User** to create new accounts
3. Assign roles (Admin/Cashier)
4. Edit or delete users as needed

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set environment variables:
   ```env
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   PORT=5001
   ```

3. Start the server:
   ```bash
   cd backend
   npm start
   ```

The backend will serve the frontend build files in production mode.

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
