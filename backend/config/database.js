const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MongoDB connection error:', error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB;