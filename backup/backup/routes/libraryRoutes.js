import express from 'express'
import libraryController from '../controllers/libraryController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import subscriptionMiddleware from '../middlewares/subscriptionMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /library:
 *   get:
 *     summary: Buscar biblioteca de jogos do usuário
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jogos disponíveis para o usuário conforme seu plano
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Sem assinatura ativa
 */
router.get('/', authMiddleware, subscriptionMiddleware, libraryController.getLibrary)

export default router