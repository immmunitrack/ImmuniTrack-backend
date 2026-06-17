const express = require('express');
const {
  getChildImmunisations,
  completeImmunisation,
  markMissed,
  upcoming,
  missed
} = require('../controllers/immunisationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/child/:childId', protect, getChildImmunisations);
router.put('/:id/complete', protect, completeImmunisation);
router.put('/:id/missed', protect, markMissed);
router.get('/upcoming', protect, upcoming);
router.get('/missed', protect, missed);

module.exports = router;
