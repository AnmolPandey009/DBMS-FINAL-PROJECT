const express = require('express');
const router = express.Router();
const {
  getAllDonations,
  getDonationById,
  getDonationsByDonor,
  createDonationRequest,
  createDonation,
  updateDonationStatus,
  updateDonation,
  getPendingDonations,
  getDonationStats
} = require('../controllers/donationController');
const {
  validateBloodDonation
} = require('../middleware/validation');
const { authenticateToken, authorizeHospital } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllDonations);
router.get('/stats', authenticateToken, getDonationStats);
router.get('/:donationId', authenticateToken, getDonationById);
router.get('/donor/:donorId', authenticateToken, getDonationsByDonor);

// Donor routes
router.post('/request', authenticateToken, createDonationRequest);

// Hospital-specific routes
router.post('/', authenticateToken, authorizeHospital, validateBloodDonation, createDonation);
router.get('/hospital/pending', authenticateToken, authorizeHospital, getPendingDonations);
router.put('/:donationId/status', authenticateToken, authorizeHospital, updateDonationStatus);
router.put('/:donationId', authenticateToken, authorizeHospital, updateDonation);

module.exports = router;
