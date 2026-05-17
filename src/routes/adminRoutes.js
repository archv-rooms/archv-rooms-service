import express from 'express'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import adminController from '../controllers/adminController.js'

const router = express.Router()

// Usuários
router.get('/users', adminMiddleware, adminController.getUsers)
router.patch('/users/:id/role', adminMiddleware, adminController.setUserRole)
router.patch('/users/:id/status', adminMiddleware, adminController.setUserStatus)

// Planos
router.get('/plans', adminMiddleware, adminController.getPlans)
router.put('/plans/:id', adminMiddleware, adminController.updatePlan)

// Vendas
router.get('/sales', adminMiddleware, adminController.getSales)

// Categorias
router.get('/categories', adminMiddleware, adminController.getCategories)
router.post('/categories', adminMiddleware, adminController.createCategory)
router.put('/categories/:id', adminMiddleware, adminController.updateCategory)
router.delete('/categories/:id', adminMiddleware, adminController.deleteCategory)
router.post('/categories/:id/games', adminMiddleware, adminController.addGameToCategory)
router.delete('/categories/:id/games/:gameId', adminMiddleware, adminController.removeGameFromCategory)

export default router