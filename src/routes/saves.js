import express from 'express'
import { getSaves, upsertSave } from '../controllers/saveController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import subscriptionMiddleware from '../middlewares/subscriptionMiddleware.js'

const router = express.Router()

router.get('/:gameId',  authMiddleware, subscriptionMiddleware, getSaves)
router.post('/:gameId', authMiddleware, subscriptionMiddleware, upsertSave)

export default router