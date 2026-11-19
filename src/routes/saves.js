import express from 'express'
import { getSaves, upsertSave, deleteSave } from '../controllers/saveController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/:gameId',  authMiddleware, getSaves)
router.post('/:gameId', authMiddleware, upsertSave)
router.delete('/:gameId/:slot', authMiddleware, deleteSave)

export default router