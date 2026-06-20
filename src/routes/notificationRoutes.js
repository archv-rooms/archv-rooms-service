import express from 'express'
import notificationController from '../controllers/notificationController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/',           authMiddleware, notificationController.getNotifications)
router.get('/unread',     authMiddleware, notificationController.getUnreadCount)
router.patch('/:id/read', authMiddleware, notificationController.markAsRead)
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead)
router.delete('/:id',     authMiddleware, notificationController.deleteNotification)

export default router