const express = require('express');
const { listUsers, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin', 'health_worker'), listUsers);
router.put('/me', protect, updateMe);

module.exports = router;
