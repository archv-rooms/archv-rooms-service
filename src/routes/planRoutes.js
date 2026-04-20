import express from 'express'
import planController from '../controllers/planController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', planController.getPlans)
router.post('/subscribe', authMiddleware, planController.subscribe)

export default router