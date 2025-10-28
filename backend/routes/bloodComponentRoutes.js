const express = require('express');
const router = express.Router();
const {
  getAllBloodComponents,
  getBloodComponentById,
  createBloodComponent,
  updateBloodComponent,
  deleteBloodComponent,
  getBloodComponentStats,
  getExpiringBloodComponents
} = require('../controllers/bloodComponentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllBloodComponents);
router.get('/stats', getBloodComponentStats);
router.get('/expiring', getExpiringBloodComponents);

// Protected routes (authentication required)
router.get('/:id', validateId, getBloodComponentById);
router.post('/', authenticateToken, authorize('admin', 'staff'), createBloodComponent);
router.put('/:id', authenticateToken, authorize('admin', 'staff'), validateId, updateBloodComponent);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteBloodComponent);

module.exports = router;
