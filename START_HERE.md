# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed (v14 or higher)
- MongoDB installed and running
- Git (optional)

## Step-by-Step Instructions

### 1. Install Dependencies

**Server Dependencies:**
```bash
cd server
npm install
```

**Client Dependencies:**
```bash
cd client
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start manually
mongod
```

### 3. Seed the Database (Optional but Recommended)
```bash
cd server
npm run seed
```
This will create sample products and demo users.

### 4. Start the Application

**Option A: Start both servers with one command (Recommended)**
```bash
cd server
npm run dev:full
```

**Option B: Start servers separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 5. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🔑 Demo Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### User Account
- **Email:** user@example.com
- **Password:** user123

## 🎯 What You Can Do

### As a User:
- Browse products with search and filters
- View product details
- Add items to cart
- Complete checkout process
- View order history
- Update profile

### As an Admin:
- Access admin dashboard
- View statistics
- Manage products (placeholder pages)
- Manage orders (placeholder pages)
- Manage users (placeholder pages)

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check the MONGODB_URI in server/.env

2. **Port Already in Use:**
   - Change PORT in server/.env
   - Or kill the process using the port

3. **Dependencies Issues:**
   - Delete node_modules and package-lock.json
   - Run npm install again

4. **CORS Errors:**
   - Make sure both servers are running
   - Check CLIENT_URL in server/.env

## 📁 Project Structure
```
E-Commerce/
├── client/          # React frontend (Port 3000)
├── server/          # Node.js backend (Port 5000)
├── README.md        # Detailed documentation
└── START_HERE.md    # This quick start guide
```

## 🎉 You're Ready!
Once both servers are running, you can start exploring the application!

Happy coding! 🚀