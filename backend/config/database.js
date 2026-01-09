const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI environment variable is not set!');
      console.error('Please set MONGODB_URI in your Render environment variables.');
      process.exit(1);
    }
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Please verify:');
    console.error('1. MONGODB_URI is set correctly in Render environment variables');
    console.error('2. MongoDB Atlas network access allows connections from Render (0.0.0.0/0)');
    console.error('3. Database user credentials are correct');
    process.exit(1);
  }
};

module.exports = connectDB;