const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getAvailableBlood,
  getBloodByGroup,
  addBloodToInventory,
  updateInventory,
  getHospitalInventory,
  getInventoryStats,
  checkBloodAvailability,
  consumeInventoryUnits
} = require('../controllers/inventoryController');
const { authenticateToken, authorizeHospital } = require('../middleware/auth');

// Public routes
router.get('/available', getAvailableBlood);
router.get('/check', checkBloodAvailability);

// Protected routes
router.get('/', getAllInventory);
// router.get('/', authenticateToken, getAllInventory);
router.get('/stats', authenticateToken, getInventoryStats);
router.get('/:bloodGroup', authenticateToken, getBloodByGroup);

// Hospital-specific routes
router.get('/hospital/inventory', authenticateToken, authorizeHospital, getHospitalInventory);
router.post('/', authenticateToken, authorizeHospital, addBloodToInventory);
router.put('/:inventoryId', authenticateToken, authorizeHospital, updateInventory);
router.post('/consume', authenticateToken, authorizeHospital, consumeInventoryUnits);

module.exports = router;
