const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  signupUser,
  loginUser,
  changePassword,
  getUserStats
} = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateUser, validateSignup, validateLogin, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/signup', validateSignup, signupUser);
router.post('/login', validateLogin, loginUser);

// Protected routes (authentication required)
router.get('/', authenticateToken, authorize('admin'), validatePagination, getAllUsers);
router.get('/stats', authenticateToken, authorize('admin'), getUserStats);
router.get('/:id', authenticateToken, validateId, getUserById);
router.post('/', authenticateToken, authorize('admin'), validateUser, createUser);
router.put('/:id', authenticateToken, authorize('admin'), validateId, updateUser);
router.put('/:id/change-password', authenticateToken, validateId, changePassword);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteUser);

module.exports = router;
