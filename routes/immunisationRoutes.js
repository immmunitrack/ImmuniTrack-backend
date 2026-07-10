const express = require('express');
const {
  getChildImmunisations,
  completeImmunisation,
  markMissed,
  upcoming,
  missed
} = require('../controllers/immunisationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/child/:childId', protect, getChildImmunisations);
router.put('/:id/complete', protect, authorize('admin', 'health_worker'), completeImmunisation);
router.put('/:id/missed', protect, authorize('admin', 'health_worker'), markMissed);
router.get('/upcoming', protect, upcoming);
router.get('/missed', protect, missed);

module.exports = router;
