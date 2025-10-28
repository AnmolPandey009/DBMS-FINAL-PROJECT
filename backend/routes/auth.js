const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const {
  validateUserRegistration,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/signup', validateUserRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

module.exports = router;
