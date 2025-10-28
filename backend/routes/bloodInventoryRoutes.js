const express = require('express');
const router = express.Router();
const {
  getAllBloodInventory,
  getBloodInventoryById,
  createBloodInventory,
  updateBloodInventory,
  deleteBloodInventory,
  getBloodInventoryStats,
  getExpiringBloodInventory
} = require('../controllers/bloodInventoryController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllBloodInventory);
router.get('/stats', getBloodInventoryStats);
router.get('/expiring', getExpiringBloodInventory);

// Protected routes (authentication required)
router.get('/:id', validateId, getBloodInventoryById);
router.post('/', authenticateToken, authorize('admin', 'staff'), createBloodInventory);
router.put('/:id', authenticateToken, authorize('admin', 'staff'), validateId, updateBloodInventory);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteBloodInventory);

module.exports = router;
