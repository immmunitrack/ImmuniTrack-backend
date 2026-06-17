const express = require('express');
const { myReminders, markRead, generate } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-reminders', protect, myReminders);
router.put('/:id/read', protect, markRead);
router.post('/generate', protect, generate);

module.exports = router;
