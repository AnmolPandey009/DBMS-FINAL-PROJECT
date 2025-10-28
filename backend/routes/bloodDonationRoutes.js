const express = require('express');
const router = express.Router();
const {
  getAllBloodDonations,
  getBloodDonationById,
  createBloodDonation,
  updateBloodDonation,
  deleteBloodDonation,
  getBloodDonationStats
} = require('../controllers/bloodDonationController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBloodDonation, validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllBloodDonations);
router.get('/stats', getBloodDonationStats);

// Protected routes (authentication required)
router.get('/:id', validateId, getBloodDonationById);
router.post('/', authenticateToken, authorize('admin', 'staff'), validateBloodDonation, createBloodDonation);
router.put('/:id', authenticateToken, authorize('admin', 'staff'), validateId, validateBloodDonation, updateBloodDonation);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteBloodDonation);

module.exports = router;
