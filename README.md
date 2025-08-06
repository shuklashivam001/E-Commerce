# MERN Stack E-Commerce Application

A full-featured e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login with JWT tokens
- Admin login with separate dashboard access
- Role-based access control (user vs admin)
- Password hashing with bcrypt
- Protected routes for authenticated users

### 🛒 E-commerce Functionality
- Product listing page with categories and search/filter
- Product detail page with image gallery
- Add to cart functionality with quantity management
- Shopping cart with update/delete items
- Checkout process with order placement
- Order history and tracking

### 🛠️ Admin Panel (CRUD Operations)
- Admin dashboard with statistics
- Product management (Create, Read, Update, Delete)
- Order management (view and change order status)
- User management (view users, delete accounts)
- Image upload functionality

### 📦 Order System
- Complete order placement from cart
- Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- Order history for users
- Admin order management

### 🎨 UI/UX Features
- Responsive design (mobile & desktop)
- Modern Bootstrap-based UI
- Loading states and error handling
- Toast notifications
- Pagination for large datasets
- Search and filter functionality

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **React Bootstrap** - UI components
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **express-validator** - Input validation

## 📁 Project Structure

```
E-Commerce/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   ├── utils/             # Utility functions
│   ├── server.js          # Entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-Commerce
   ```

   > **Note:** This repository uses `.gitignore` to exclude `node_modules`, build files, and other large directories. After cloning, you'll need to install dependencies as shown in the next steps.

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Copy the example environment file and configure it:
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your actual values:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=30d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000
   
   # Cloudinary (Optional - for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Database Setup**
   
   This application is configured to use **MongoDB Atlas** (cloud database). 
   
   **Option A: MongoDB Atlas (Recommended)**
   - The `.env` file is already configured for MongoDB Atlas
   - Make sure your MongoDB Atlas cluster is running
   - Ensure your IP address is whitelisted in Atlas Network Access
   
   **Option B: Local MongoDB**
   - If you prefer local MongoDB, update the `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
   ```
   - Then start your local MongoDB service:
   ```bash
   mongod
   ```

6. **Seed the database (Optional)**
   ```bash
   cd server
   npm run seed
   ```

7. **Start the application**
   
   **Option 1: Start both servers separately**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend server
   cd client
   npm start
   ```
   
   **Option 2: Start both servers concurrently**
   ```bash
   # From the server directory
   npm run dev:full
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🔑 Demo Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### User Account
- **Email:** user@example.com
- **Password:** user123

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/list` - Get featured products
- `POST /api/products/:id/reviews` - Add product review

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Test MongoDB Atlas connection
npm run test-admin

# Test product creation functionality
npm run test-products

# Run frontend tests
cd client
npm test
```

## 🛍️ Product Management

### Admin Product Creation
The application includes a comprehensive product creation system:

**Features:**
- ✅ Rich form with validation
- ✅ Multiple image upload (max 5 images, 5MB each)
- ✅ Image preview and management
- ✅ Dynamic specifications builder
- ✅ Tag system with easy add/remove
- ✅ Auto-discount calculation
- ✅ Category selection
- ✅ Stock management
- ✅ Featured product toggle
- ✅ Real-time form validation
- ✅ MongoDB Atlas integration

**Access:** `/admin/products/create` (Admin only)

**Supported Image Formats:** JPG, PNG, GIF, WebP

**Product Categories:**
- Electronics
- Clothing
- Books
- Home & Garden
- Sports
- Beauty
- Toys
- Automotive
- Health
- Food
- Other

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is configured
3. Deploy the server directory

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder
3. Set environment variables for API URL

### Full Stack Deployment
1. Build the React app and copy to server's public folder
2. Deploy as a single Node.js application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React.js team for the amazing library
- MongoDB team for the database
- Express.js team for the web framework
- Bootstrap team for the UI components
- All open-source contributors

## 📞 Support

If you have any questions or need help with setup, please create an issue in the repository or contact the development team.

---

**Happy Coding! 🚀**
