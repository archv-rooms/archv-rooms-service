import express from 'express'
import planController from '../controllers/planController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Listar todos os planos
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Lista de planos disponíveis
 */
router.get('/', planController.getPlans)

/**
 * @swagger
 * /plans/subscribe:
 *   post:
 *     summary: Assinar um plano
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Assinatura realizada com sucesso
 *       401:
 *         description: Token não fornecido
 */
router.post('/subscribe', authMiddleware, planController.subscribe)

export default router