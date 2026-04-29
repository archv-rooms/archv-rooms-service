import express from 'express';
import checkoutController from '../controllers/checkoutController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware, checkoutController.checkout);

export default router;