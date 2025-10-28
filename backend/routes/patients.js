const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  getPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
} = require('../controllers/patientController');
const {
  validatePatientRegistration
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllPatients);
router.get('/profile', authenticateToken, getPatientProfile);
router.get('/stats', authenticateToken, getPatientStats);
router.get('/:patientId', authenticateToken, getPatientById);

// Patient-specific routes
router.post('/', authenticateToken, validatePatientRegistration, createPatient);
router.put('/:patientId', authenticateToken, updatePatient);
router.delete('/:patientId', authenticateToken, deletePatient);

module.exports = router;
