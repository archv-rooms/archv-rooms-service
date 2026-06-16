import express from 'express'
import gameController from '../controllers/gameController.js'
import { upload } from '../config/multer.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware.js'
import subscriptionMiddleware from '../middlewares/subscriptionMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Listar todos os jogos
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Lista de jogos
 */
router.get('/', optionalAuthMiddleware, subscriptionMiddleware, gameController.getGames)

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Buscar jogo por ID
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo encontrado
 */
router.get('/:id', authMiddleware, subscriptionMiddleware, gameController.getGameById)

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Criar novo jogo
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, console, image, accessLevel]
 *             properties:
 *               title:
 *                 type: string
 *               console:
 *                 type: string
 *               image:
 *                 type: string
 *               accessLevel:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Jogo criado com sucesso
 */
router.post('/', authMiddleware, gameController.createGame)

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Atualizar jogo
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo atualizado com sucesso
 */
router.put('/:id', authMiddleware, gameController.updateGame)

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Deletar jogo
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo deletado com sucesso
 */
router.delete('/:id', authMiddleware, gameController.deleteGame)

/**
 * @swagger
 * /api/games/{id}/image:
 *   patch:
 *     summary: Atualizar imagem do jogo
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagem atualizada com sucesso
 */
router.patch('/:id/image', authMiddleware, upload.single('image'), gameController.updateGameImage)

/**
 * @swagger
 * /api/games/{id}/file:
 *   patch:
 *     summary: Atualizar arquivo do jogo
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Arquivo atualizado com sucesso
 */
router.patch('/:id/file', authMiddleware, upload.single('file'), gameController.updateGameFile)

export default router