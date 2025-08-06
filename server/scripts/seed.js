const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  }
];

const products = [
  {
    name: 'iPhone 14 Pro',
    description: 'The latest iPhone with advanced camera system and A16 Bionic chip.',
    price: 999.99,
    originalPrice: 1099.99,
    category: 'Electronics',
    brand: 'Apple',
    stock: 50,
    images: [
      { url: '/api/placeholder/400/400', alt: 'iPhone 14 Pro' }
    ],
    specifications: [
      { key: 'Display', value: '6.1-inch Super Retina XDR' },
      { key: 'Chip', value: 'A16 Bionic' },
      { key: 'Camera', value: '48MP Main camera' },
      { key: 'Storage', value: '128GB' }
    ],
    tags: ['smartphone', 'apple', 'ios'],
    featured: true,
    discount: 9,
    ratings: { average: 4.8, count: 125 }
  },
  {
    name: 'Samsung Galaxy S23',
    description: 'Flagship Android smartphone with excellent camera and performance.',
    price: 799.99,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 30,
    images: [
      { url: '/api/placeholder/400/400', alt: 'Samsung Galaxy S23' }
    ],
    specifications: [
      { key: 'Display', value: '6.1-inch Dynamic AMOLED' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { key: 'Camera', value: '50MP Triple camera' },
      { key: 'Storage', value: '256GB' }
    ],
    tags: ['smartphone', 'samsung', 'android'],
    featured: true,
    ratings: { average: 4.6, count: 89 }
  },
  {
    name: 'MacBook Air M2',
    description: 'Thin, light, and powerful laptop with Apple M2 chip.',
    price: 1199.99,
    category: 'Electronics',
    brand: 'Apple',
    stock: 25,
    images: [
      { url: '/api/placeholder/400/400', alt: 'MacBook Air M2' }
    ],
    specifications: [
      { key: 'Chip', value: 'Apple M2' },
      { key: 'Display', value: '13.6-inch Liquid Retina' },
      { key: 'Memory', value: '8GB unified memory' },
      { key: 'Storage', value: '256GB SSD' }
    ],
    tags: ['laptop', 'apple', 'macbook'],
    featured: true,
    ratings: { average: 4.9, count: 67 }
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air cushioning.',
    price: 149.99,
    originalPrice: 179.99,
    category: 'Sports',
    brand: 'Nike',
    stock: 100,
    images: [
      { url: '/api/placeholder/400/400', alt: 'Nike Air Max 270' }
    ],
    specifications: [
      { key: 'Type', value: 'Running Shoes' },
      { key: 'Material', value: 'Mesh and synthetic' },
      { key: 'Sole', value: 'Rubber with Max Air' },
      { key: 'Sizes', value: '7-12 US' }
    ],
    tags: ['shoes', 'nike', 'running', 'sports'],
    discount: 17,
    ratings: { average: 4.4, count: 203 }
  },
  {
    name: 'Sony WH-1000XM4',
    description: 'Industry-leading noise canceling wireless headphones.',
    price: 279.99,
    originalPrice: 349.99,
    category: 'Electronics',
    brand: 'Sony',
    stock: 40,
    images: [
      { url: '/api/placeholder/400/400', alt: 'Sony WH-1000XM4' }
    ],
    specifications: [
      { key: 'Type', value: 'Over-ear wireless' },
      { key: 'Battery', value: '30 hours' },
      { key: 'Noise Canceling', value: 'Industry-leading' },
      { key: 'Connectivity', value: 'Bluetooth 5.0' }
    ],
    tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
    featured: true,
    discount: 20,
    ratings: { average: 4.7, count: 156 }
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-leg jeans with authentic fit and feel.',
    price: 89.99,
    category: 'Clothing',
    brand: 'Levi\'s',
    stock: 75,
    images: [
      { url: '/api/placeholder/400/400', alt: 'Levi\'s 501 Jeans' }
    ],
    specifications: [
      { key: 'Fit', value: 'Straight leg' },
      { key: 'Material', value: '100% Cotton' },
      { key: 'Rise', value: 'Mid rise' },
      { key: 'Sizes', value: '28-40 waist' }
    ],
    tags: ['jeans', 'levis', 'denim', 'clothing'],
    ratings: { average: 4.3, count: 89 }
  },
  {
    name: 'The Great Gatsby',
    description: 'Classic American novel by F. Scott Fitzgerald.',
    price: 12.99,
    category: 'Books',
    brand: 'Scribner',
    stock: 200,
    images: [
      { url: '/api/placeholder/400/400', alt: 'The Great Gatsby' }
    ],
    specifications: [
      { key: 'Author', value: 'F. Scott Fitzgerald' },
      { key: 'Pages', value: '180' },
      { key: 'Publisher', value: 'Scribner' },
      { key: 'Language', value: 'English' }
    ],
    tags: ['book', 'classic', 'literature', 'fiction'],
    ratings: { average: 4.2, count: 1250 }
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional electric pressure cooker.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    stock: 35,
    images: [
      { url: '/api/placeholder/400/400', alt: 'Instant Pot Duo' }
    ],
    specifications: [
      { key: 'Capacity', value: '6 Quart' },
      { key: 'Functions', value: '7-in-1' },
      { key: 'Material', value: 'Stainless Steel' },
      { key: 'Programs', value: '13 Smart Programs' }
    ],
    tags: ['kitchen', 'cooking', 'pressure-cooker', 'appliance'],
    discount: 20,
    ratings: { average: 4.6, count: 892 }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-ecommerce');

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create users one by one to trigger pre-save hooks for password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();