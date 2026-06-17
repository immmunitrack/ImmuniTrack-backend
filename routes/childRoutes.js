const express = require('express');
const { createChild, myChildren, getChild, updateChild, deleteChild } = require('../controllers/childController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('caregiver'), createChild);
router.get('/my-children', protect, authorize('caregiver'), myChildren);
router.get('/:id', protect, getChild);
router.put('/:id', protect, updateChild);
router.delete('/:id', protect, deleteChild);

module.exports = router;
