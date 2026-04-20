import express from 'express'
import libraryController from '../controllers/libraryController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import subscriptionMiddleware from '../middlewares/subscriptionMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, subscriptionMiddleware, libraryController.getLibrary)

export default router