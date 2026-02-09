const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const userController = require('../controllers/userController');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashed, phone, type: 'customer' });
    await user.save();
    
    // Generate token with 7-day expiration
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id, 
        name: user.name, 
        email: user.email, 
        type: user.type, 
        isDoctor: user.isDoctor 
      } 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with type validation
router.post('/login', async (req, res) => {
  try {
    const { email, password, type } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Login type (user, doctor, admin) is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Type validation: ensure user type matches login type
    let isValidType = false;
    
    if (type === 'admin' && user.type === 'admin') {
      isValidType = true;
    } else if (type === 'doctor' && (user.type === 'doctor' || user.isDoctor)) {
      isValidType = true;
    } else if (type === 'user' && user.type === 'customer') {
      isValidType = true;
    }
    
    if (!isValidType) {
      return res.status(401).json({ 
        message: `Invalid login type. This account is a ${user.type === 'admin' ? 'admin' : user.isDoctor ? 'doctor' : 'user'} account.` 
      });
    }
    
    // Generate token with 7-day expiration
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id, 
        name: user.name, 
        email: user.email, 
        type: user.type, 
        isDoctor: user.isDoctor 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in user's profile
const auth = require('../middlewares/authMiddleware');
router.get('/profile', auth, userController.getProfile);

module.exports = router;
