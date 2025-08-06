const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-ecommerce');

    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);

    // Remove existing admin user if exists
    await User.deleteOne({ email: 'admin@example.com' });
    console.log('🗑️  Removed existing admin user (if any)');

    // Create new admin user using the User model (this will use the pre-save hook)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');

    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    // Verify the user can be found and password works
    const testUser = await User.findOne({ email: 'admin@example.com' }).select('+password');
    if (testUser) {
      const isPasswordValid = await testUser.comparePassword('admin123');
      console.log(`\n🔍 Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (isPasswordValid) {
        console.log('🎉 Admin user is ready to use!');
      } else {
        console.log('❌ Password verification failed. Please try running the script again.');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the reset function
resetAdmin();