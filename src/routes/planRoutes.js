const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', planController.getPlans);
router.post('/subscribe', authMiddleware, planController.subscribe);

module.exports = router;
