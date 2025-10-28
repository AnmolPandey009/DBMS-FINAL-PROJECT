const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  getHospitalProfile,
  createHospital,
  updateHospital,
  approveHospital,
  deleteHospital,
  getPendingHospitals,
  getHospitalStats
} = require('../controllers/hospitalController');
const {
  validateHospitalRegistration
} = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllHospitals);
router.get('/profile', authenticateToken, getHospitalProfile);
router.get('/stats', authenticateToken, getHospitalStats);
router.get('/:hospitalId', authenticateToken, getHospitalById);

// Hospital-specific routes
router.post('/', authenticateToken, validateHospitalRegistration, createHospital);
router.put('/:hospitalId', authenticateToken, updateHospital);
router.delete('/:hospitalId', authenticateToken, deleteHospital);

// Admin-only routes
router.get('/admin/pending', authenticateToken, authorizeRoles('admin'), getPendingHospitals);
router.put('/:hospitalId/approve', authenticateToken, authorizeRoles('admin'), approveHospital);

module.exports = router;
