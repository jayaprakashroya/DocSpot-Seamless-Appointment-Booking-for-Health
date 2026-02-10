const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle disconnections
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    
    if (retries > 0) {
      console.log(`⏳ Retrying connection in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return connectDB(retries - 1, Math.min(delay * 2, 10000)); // Exponential backoff
    } else {
      console.error('❌ Failed to connect to MongoDB after all retries');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
