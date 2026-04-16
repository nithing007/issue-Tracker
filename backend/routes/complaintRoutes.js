const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, admin, getAllComplaints);
router.put('/:id', protect, admin, updateComplaintStatus);
router.patch('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
