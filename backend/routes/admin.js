const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPendingHospitals,
  getDashboardStats,
  deactivateUser,
  activateUser,
  getSystemLogs,
  getBloodGroupStats
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/deactivate-user/:userId', deactivateUser);
router.put('/activate-user/:userId', activateUser);

// Hospital management
router.get('/pending-hospitals', getPendingHospitals);

// Dashboard and statistics
router.get('/dashboard-stats', getDashboardStats);
router.get('/system-logs', getSystemLogs);
router.get('/blood-group-stats', getBloodGroupStats);

module.exports = router;
