const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  getRequestsByPatient,
  getRequestsByStatus,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
  getPendingRequests,
  getRequestStats
} = require('../controllers/requestController');
const {
  validateBloodRequest
} = require('../middleware/validation');
const { authenticateToken, authorizeHospital } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllRequests);
router.get('/stats', authenticateToken, getRequestStats);
router.get('/:requestId', authenticateToken, getRequestById);
router.get('/patient/:patientId', authenticateToken, getRequestsByPatient);
router.get('/status/:status', authenticateToken, getRequestsByStatus);

// Patient and Hospital routes
router.post('/', authenticateToken, createRequest);
router.put('/:requestId', authenticateToken, updateRequest);
router.delete('/:requestId', authenticateToken, deleteRequest);

// Hospital-specific routes
router.get('/hospital/pending', authenticateToken, authorizeHospital, getPendingRequests);
router.put('/:requestId/status', authenticateToken, authorizeHospital, updateRequestStatus);

module.exports = router;
