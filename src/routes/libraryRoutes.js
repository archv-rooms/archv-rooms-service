import express from 'express'
import libraryController from '../controllers/libraryController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /library:
 *   get:
 *     summary: Buscar biblioteca de jogos
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jogos disponíveis
 *       401:
 *         description: Token não fornecido
 */
router.get('/', authMiddleware, libraryController.getLibrary)

export default router