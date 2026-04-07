const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middlewares/authMiddleware');
const subscriptionMiddleware = require('../middlewares/subscriptionMiddleware');

router.get('/', authMiddleware, subscriptionMiddleware, libraryController.getLibrary);

module.exports = router;
