const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
} = require('../controllers/patientController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validatePatient, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllPatients);
router.get('/stats', getPatientStats);

// Protected routes (authentication required)
router.get('/:id', validateId, getPatientById);
router.post('/', authenticateToken, authorize('admin', 'staff', 'doctor'), validatePatient, createPatient);
router.put('/:id', authenticateToken, authorize('admin', 'staff', 'doctor'), validateId, validatePatient, updatePatient);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deletePatient);

module.exports = router;
