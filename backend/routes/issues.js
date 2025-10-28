const express = require('express');
const router = express.Router();
const {
  getAllIssues,
  getIssueById,
  getIssuesByRequest,
  createIssue,
  getHospitalIssues,
  getIssueStats,
  getIssuesByDateRange
} = require('../controllers/issueController');
const {
  validateBloodIssue
} = require('../middleware/validation');
const { authenticateToken, authorizeHospital } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllIssues);
router.get('/stats', authenticateToken, getIssueStats);
router.get('/:issueId', authenticateToken, getIssueById);
router.get('/request/:requestId', authenticateToken, getIssuesByRequest);
router.get('/date-range', authenticateToken, getIssuesByDateRange);

// Hospital-specific routes
router.get('/hospital/issues', authenticateToken, authorizeHospital, getHospitalIssues);
router.post('/', authenticateToken, authorizeHospital, validateBloodIssue, createIssue);

module.exports = router;
