const express = require('express');
const router = express.Router();
const {
  getAllBloodIssues,
  getBloodIssueById,
  createBloodIssue,
  updateBloodIssue,
  deleteBloodIssue,
  getBloodIssueStats
} = require('../controllers/bloodIssueController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, getAllBloodIssues);
router.get('/stats', getBloodIssueStats);

// Protected routes (authentication required)
router.get('/:id', validateId, getBloodIssueById);
router.post('/', authenticateToken, authorize('admin', 'staff', 'doctor'), createBloodIssue);
router.put('/:id', authenticateToken, authorize('admin', 'staff'), validateId, updateBloodIssue);
router.delete('/:id', authenticateToken, authorize('admin'), validateId, deleteBloodIssue);

module.exports = router;
