const express = require('express');
const {
  getProfile,
  upsertEmployerProfile,
  upsertJobSeekerProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/employer', protect, authorize('employer'), upsertEmployerProfile);
router.put('/job-seeker', protect, authorize('job_seeker'), upload.single('cv'), upsertJobSeekerProfile);

module.exports = router;
