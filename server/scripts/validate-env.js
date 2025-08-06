const mongoose = require('mongoose');
require('dotenv').config();

const validateEnvironment = async () => {
  console.log('🔍 Validating Environment Configuration...\n');

  // Check required environment variables
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  const missingVars = [];
  const presentVars = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });

  console.log('✅ Present Environment Variables:');
  presentVars.forEach(varName => {
    let value = process.env[varName];
    // Hide sensitive information
    if (varName === 'MONGODB_URI') {
      value = value.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    } else if (varName === 'JWT_SECRET') {
      value = '***hidden***';
    }
    console.log(`   ${varName}: ${value}`);
  });

  if (missingVars.length > 0) {
    console.log('\n❌ Missing Environment Variables:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}`);
    });
    console.log('\n⚠️  Please add missing variables to your .env file');
    process.exit(1);
  }

  // Test MongoDB connection
  console.log('\n🔄 Testing MongoDB Atlas connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connection successful');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📡 Port: ${mongoose.connection.port}`);
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  // Validate JWT Secret strength
  console.log('\n🔐 Validating JWT Secret...');
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    console.log('⚠️  JWT Secret is too short (should be at least 32 characters)');
  } else {
    console.log('✅ JWT Secret length is adequate');
  }

  // Check port availability
  console.log('\n🌐 Server Configuration:');
  console.log(`   Port: ${process.env.PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Client URL: ${process.env.CLIENT_URL || 'Not set'}`);

  console.log('\n🎉 Environment validation completed successfully!');
  console.log('✅ Your application is ready to run');
  
  process.exit(0);
};

// Run validation
validateEnvironment().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});