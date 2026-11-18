import express from 'express'
import roomController from '../controllers/roomController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, roomController.listRooms)
router.post('/', authMiddleware, roomController.createRoom)
router.post('/:id/join', authMiddleware, roomController.joinRoom)
router.post('/:id/leave', authMiddleware, roomController.leaveRoom)
router.get('/:id/state', authMiddleware, roomController.getState)
router.post('/:id/ready', authMiddleware, roomController.setReady)
router.post('/:id/messages', authMiddleware, roomController.sendRoomMessage)
router.post('/:id/start', authMiddleware, roomController.startRoom)

export default router