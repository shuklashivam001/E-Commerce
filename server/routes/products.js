const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { isActive: true };

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Rating filter
    if (req.query.rating) {
      filter['ratings.average'] = { $gte: parseFloat(req.query.rating) };
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort['ratings.average'] = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'name':
        sort.name = 1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews');

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get categories for filter options
    const categories = await Product.distinct('category', { isActive: true });

    // Get brands for filter options
    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: null } });

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        categories,
        brands
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(404).json({ message: 'Product not available' });
    }

    res.json(product);

  } catch (error) {
    console.error('Product fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      featured: true 
    })
    .limit(8)
    .select('-reviews')
    .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    console.error('Featured products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      category: req.params.category, 
      isActive: true 
    })
    .skip(skip)
    .limit(limit)
    .select('-reviews')
    .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ 
      category: req.params.category, 
      isActive: true 
    });

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
    console.error('Category products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching category products' });
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
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

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: parseInt(rating),
      comment
    };

    product.reviews.push(review);
    product.updateRatings();

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });

  } catch (error) {
    console.error('Review add error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
});

// @desc    Get product suggestions/recommendations
// @route   GET /api/products/:id/suggestions
// @access  Public
router.get('/:id/suggestions', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get products from same category, excluding current product
    const suggestions = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(4)
    .select('-reviews')
    .sort({ 'ratings.average': -1 });

    res.json(suggestions);

  } catch (error) {
    console.error('Suggestions fetch error:', error);
    res.status(500).json({ message: 'Server error fetching suggestions' });
  }
});

module.exports = router;