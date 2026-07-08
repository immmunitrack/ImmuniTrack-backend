const express = require('express');
const { listSchedule, createScheduleItem, updateScheduleItem, updateStatus, deleteScheduleItem } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, listSchedule);
router.post('/', protect, authorize('admin', 'health_worker'), createScheduleItem);
router.put('/:id', protect, authorize('admin', 'health_worker'), updateScheduleItem);
router.put('/:id/status', protect, authorize('admin', 'health_worker'), updateStatus);
router.delete('/:id', protect, authorize('admin', 'health_worker'), deleteScheduleItem);

module.exports = router;
