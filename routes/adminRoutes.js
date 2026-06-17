const express = require('express');
const { stats, users, children, dueThisWeek, missedImmunisations } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'health_worker'));

router.get('/stats', stats);
router.get('/users', users);
router.get('/children', children);
router.get('/due-this-week', dueThisWeek);
router.get('/missed-immunisations', missedImmunisations);

module.exports = router;
