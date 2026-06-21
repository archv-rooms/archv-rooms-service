import express from 'express'
import chatController from '../controllers/chatController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/conversations', authMiddleware, chatController.getConversations)
router.post('/conversations/direct', authMiddleware, chatController.getOrCreateDirectConversation)
router.get('/conversations/:conversationId/messages', authMiddleware, chatController.getMessages)
router.post('/conversations/:conversationId/messages', authMiddleware, chatController.sendMessage)

export default router