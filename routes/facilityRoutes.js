const express = require('express');
const { listFacilities } = require('../controllers/facilityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listFacilities);

module.exports = router;
