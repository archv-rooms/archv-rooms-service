import express from 'express'
import { getSaves, upsertSave } from '../controllers/saveController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/:gameId',  authMiddleware, getSaves)
router.post('/:gameId', authMiddleware, upsertSave)

export default router