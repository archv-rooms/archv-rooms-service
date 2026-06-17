import express from 'express'
import gameSessionController from '../controllers/gameSessionController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/start',      authMiddleware, gameSessionController.startSession)
router.patch('/:id/end',   authMiddleware, gameSessionController.endSession)
router.get('/history',     authMiddleware, gameSessionController.getHistory)

export default router