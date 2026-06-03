import express from 'express'
import { upload } from '../config/multer.js'   // memoryStorage — necessário para o Cloudinary
import userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/profile',     authMiddleware,                          userController.getProfile)
router.patch('/avatar-url', authMiddleware,                         userController.updateAvatarUrl)
router.patch('/avatar-file', authMiddleware, upload.single('avatar'), userController.updateAvatarFile)

export default router
