const express = require('express');
const router = express.Router();
const {
  getAllBloodRequests,
  getBloodRequestById,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  updateBloodRequestStatus,
  getBloodRequestStats
} = require('../controllers/bloodRequestController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBloodRequest, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllBloodRequests);
router.get('/stats', getBloodRequestStats);

// Protected routes (authentication required)
router.get('/:id', validateId, getBloodRequestById);
router.post('/', authenticateToken, authorize('admin', 'staff', 'doctor'), validateBloodRequest, createBloodRequest);
router.put('/:id', authenticateToken, authorize('admin', 'staff', 'doctor'), validateId, validateBloodRequest, updateBloodRequest);
router.put('/:id/status', authenticateToken, authorize('admin', 'staff'), validateId, updateBloodRequestStatus);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteBloodRequest);

module.exports = router;
