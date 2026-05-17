import express from 'express'
import userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Buscar perfil do usuário logado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil do usuário
 *       401:
 *         description: Token não fornecido
 */
router.get('/profile', authMiddleware, userController.getProfile)

export default router