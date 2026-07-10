const express = require('express');
const { register, login, me, login2FA, setup2FA, verify2FA, disable2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/2fa', login2FA);
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.get('/me', protect, me);

module.exports = router;
