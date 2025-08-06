const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// ============ DASHBOARD STATS ============

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    
    // Get revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        averageOrderValue: revenueStats[0]?.averageOrderValue || 0
      },
      recentOrders,
      orderStatusStats,
      monthlyRevenue
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching admin statistics' });
  }
});

// ============ PRODUCT MANAGEMENT ============

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-reviews');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post('/products', 
  upload.array('images', 5),
  handleMulterError,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn([
      'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 
      'Beauty', 'Toys', 'Automotive', 'Health', 'Food', 'Other'
    ]).withMessage('Invalid category'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const {
        name, description, price, originalPrice, category, brand,
        stock, specifications, tags, featured, discount
      } = req.body;

      // Process uploaded images
      const images = req.files ? req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: name
      })) : [];

      // Parse specifications if provided
      let parsedSpecifications = [];
      if (specifications) {
        try {
          parsedSpecifications = JSON.parse(specifications);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid specifications format' });
        }
      }

      // Parse tags if provided
      let parsedTags = [];
      if (tags) {
        parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      }

      const product = new Product({
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        brand,
        stock: parseInt(stock),
        images,
        specifications: parsedSpecifications,
        tags: parsedTags,
        featured: featured === 'true',
        discount: discount ? parseFloat(discount) : 0
      });

      const savedProduct = await product.save();

      res.status(201).json({
        message: 'Product created successfully',
        product: savedProduct
      });

    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({ message: 'Server error creating product' });
    }
  }
);

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/products/:id',
  upload.array('images', 5),
  handleMulterError,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().isIn([
      'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 
      'Beauty', 'Toys', 'Automotive', 'Health', 'Food', 'Other'
    ]).withMessage('Invalid category'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const updateData = { ...req.body };

      // Process new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
          url: `/uploads/${file.filename}`,
          alt: updateData.name || product.name
        }));
        updateData.images = [...product.images, ...newImages];
      }

      // Parse specifications if provided
      if (updateData.specifications) {
        try {
          updateData.specifications = JSON.parse(updateData.specifications);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid specifications format' });
        }
      }

      // Parse tags if provided
      if (updateData.tags) {
        updateData.tags = Array.isArray(updateData.tags) ? 
          updateData.tags : 
          updateData.tags.split(',').map(tag => tag.trim());
      }

      // Convert string booleans
      if (updateData.featured !== undefined) {
        updateData.featured = updateData.featured === 'true';
      }
      if (updateData.isActive !== undefined) {
        updateData.isActive = updateData.isActive === 'true';
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({ message: 'Server error updating product' });
    }
  }
);

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// ============ ORDER MANAGEMENT ============

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.isPaid !== undefined) {
      filter.isPaid = req.query.isPaid === 'true';
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', [
  body('status').isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.updateStatus(status);
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// ============ USER MANAGEMENT ============

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;