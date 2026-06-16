import express from 'express'
import { upload } from '../config/multer.js'
import userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/profile',      authMiddleware,                           userController.getProfile)
router.patch('/name',        authMiddleware,                           userController.updateName)
router.patch('/avatar-url',  authMiddleware,                           userController.updateAvatarUrl)
router.patch('/avatar-file', authMiddleware, upload.single('avatar'),  userController.updateAvatarFile)
router.patch('/onboarding', authMiddleware, userController.completeOnboarding)
router.get('/payments', authMiddleware, userController.getPaymentHistory)

export default router
