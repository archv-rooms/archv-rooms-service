import express from 'express'
import roomController from '../controllers/roomController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, roomController.listRooms)
router.post('/', authMiddleware, roomController.createRoom)
router.post('/:id/join', authMiddleware, roomController.joinRoom)
router.post('/:id/leave', authMiddleware, roomController.leaveRoom)

export default router