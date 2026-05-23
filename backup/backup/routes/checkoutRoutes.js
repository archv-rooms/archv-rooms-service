import express from 'express';
import checkoutController from '../controllers/checkoutController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Realizar checkout de um plano
 *     tags: [Checkout]
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
 *                 description: ID do plano a ser adquirido
 *     responses:
 *       200:
 *         description: Checkout realizado com sucesso
 *       401:
 *         description: Token não fornecido
 */
router.post('/', authMiddleware, checkoutController.checkout);

export default router;