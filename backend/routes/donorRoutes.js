const express = require('express');
const router = express.Router();
const {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonorStats
} = require('../controllers/donorController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateDonor, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllDonors);
router.get('/stats', getDonorStats);

// Protected routes (authentication required)
router.get('/:id', validateId, getDonorById);
router.post('/', authenticateToken, authorize('admin', 'staff'), validateDonor, createDonor);
router.put('/:id', authenticateToken, authorize('admin', 'staff'), validateId, validateDonor, updateDonor);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteDonor);

module.exports = router;
