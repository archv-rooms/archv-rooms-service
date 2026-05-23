import express from 'express'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import adminController from '../controllers/adminController.js'

const router = express.Router()

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get('/users', adminMiddleware, adminController.getUsers)

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Alterar role do usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: Role atualizada com sucesso
 *       403:
 *         description: Acesso negado
 */
router.patch('/users/:id/role', adminMiddleware, adminController.setUserRole)

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Alterar status do usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/users/:id/status', adminMiddleware, adminController.setUserStatus)

/**
 * @swagger
 * /admin/plans:
 *   get:
 *     summary: Listar todos os planos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos
 */
router.get('/plans', adminMiddleware, adminController.getPlans)

/**
 * @swagger
 * /admin/plans/{id}:
 *   put:
 *     summary: Atualizar plano
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 */
router.put('/plans/:id', adminMiddleware, adminController.updatePlan)

/**
 * @swagger
 * /admin/sales:
 *   get:
 *     summary: Listar todas as vendas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendas/assinaturas
 */
router.get('/sales', adminMiddleware, adminController.getSales)

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categories', adminMiddleware, adminController.getCategories)

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 */
router.post('/categories', adminMiddleware, adminController.createCategory)

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 */
router.put('/categories/:id', adminMiddleware, adminController.updateCategory)

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags: [Admin]
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
 *         description: Categoria deletada com sucesso
 */
router.delete('/categories/:id', adminMiddleware, adminController.deleteCategory)

/**
 * @swagger
 * /admin/categories/{id}/games:
 *   post:
 *     summary: Associar jogo a categoria
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId]
 *             properties:
 *               gameId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Jogo associado com sucesso
 */
router.post('/categories/:id/games', adminMiddleware, adminController.addGameToCategory)

/**
 * @swagger
 * /admin/categories/{id}/games/{gameId}:
 *   delete:
 *     summary: Remover jogo de categoria
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo removido da categoria com sucesso
 */
router.delete('/categories/:id/games/:gameId', adminMiddleware, adminController.removeGameFromCategory)

router.delete('/plans/:id', adminMiddleware, adminController.deletePlan)
router.patch('/sales/:id/cancel', adminMiddleware, adminController.cancelSale)

router.get('/games', adminMiddleware, adminController.getGames)
router.post('/games', adminMiddleware, adminController.createGame)
router.put('/games/:id', adminMiddleware, adminController.updateGame)
router.delete('/games/:id', adminMiddleware, adminController.deleteGame)

export default router