// src/routes/platforms.routes.js
import { Router } from 'express';
import { getPlatforms } from '../controllers/platforms.Controller.js';

const router = Router();

// Rota pública — sem authMiddleware nem subscriptionMiddleware
router.get('/', getPlatforms);

export default router;