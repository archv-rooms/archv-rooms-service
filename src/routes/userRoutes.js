import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage })

const router = express.Router()

router.get('/profile', authMiddleware, userController.getProfile)
router.patch('/avatar-url', authMiddleware, userController.updateAvatarUrl)
router.patch('/avatar-file', authMiddleware, upload.single('avatar'), userController.updateAvatarFile)

export default router