import express from 'express'
import friendController from '../controllers/friendController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/search', authMiddleware, friendController.searchUsers)
router.get('/activity', authMiddleware, friendController.getFriendsActivity)
router.get('/pending', authMiddleware, friendController.getPendingRequests)
router.get('/', authMiddleware, friendController.getFriends)
router.post('/request', authMiddleware, friendController.sendFriendRequest)
router.patch('/:id/respond', authMiddleware, friendController.respondFriendRequest)
router.delete('/:id', authMiddleware, friendController.removeFriend)

export default router