const express = require('express');
const router = express.Router();
const {
  getAllDonors,
  getDonorById,
  getDonorsByBloodGroup,
  getDonorProfile,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonorStats
} = require('../controllers/donorController');
const {
  validateDonorRegistration
} = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/blood/:bloodGroup', getDonorsByBloodGroup);

// Protected routes
router.get('/', authenticateToken, getAllDonors);
router.get('/profile', authenticateToken, getDonorProfile);
router.get('/stats', authenticateToken, getDonorStats);
router.get('/:donorId', authenticateToken, getDonorById);

// Donor-specific routes
router.post('/', authenticateToken, validateDonorRegistration, createDonor);
router.put('/:donorId', authenticateToken, updateDonor);
router.delete('/:donorId', authenticateToken, deleteDonor);

module.exports = router;
