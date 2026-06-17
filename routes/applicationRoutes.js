const express = require('express');
const {
  applyForJob,
  myApplications,
  jobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/apply/:jobId', protect, authorize('job_seeker'), upload.single('cv'), applyForJob);
router.get('/my-applications', protect, authorize('job_seeker'), myApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), jobApplications);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
