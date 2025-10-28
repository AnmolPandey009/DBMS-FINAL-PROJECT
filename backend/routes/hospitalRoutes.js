const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalStats,
  getHospitalsByLocation
} = require('../controllers/hospitalController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateHospital, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllHospitals);
router.get('/stats', getHospitalStats);
router.get('/location', getHospitalsByLocation);

// Protected routes (authentication required)
router.get('/:id', validateId, getHospitalById);
router.post('/', authenticateToken, authorize('admin'), validateHospital, createHospital);
router.put('/:id', authenticateToken, authorize('admin'), validateId, validateHospital, updateHospital);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteHospital);

module.exports = router;
