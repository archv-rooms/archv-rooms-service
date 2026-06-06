import express from 'express'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import adminController from '../controllers/adminController.js'

const router = express.Router()

// ── USERS ─────────────────────────────────────────────────────────
router.get('/users',                adminMiddleware, adminController.getUsers)
router.patch('/users/:id/role',     adminMiddleware, adminController.setUserRole)
router.patch('/users/:id/status',   adminMiddleware, adminController.setUserStatus)
router.post('/users/:id/ban',       adminMiddleware, adminController.banUser)
router.post('/users/:id/unban',     adminMiddleware, adminController.unbanUser)
router.post('/users/:id/grant-plan',adminMiddleware, adminController.grantPlan)

// ── PLANS ─────────────────────────────────────────────────────────
router.get('/plans',        adminMiddleware, adminController.getPlans)
router.put('/plans/:id',    adminMiddleware, adminController.updatePlan)
router.delete('/plans/:id', adminMiddleware, adminController.deletePlan)

// ── SALES ─────────────────────────────────────────────────────────
router.get('/sales',              adminMiddleware, adminController.getSales)
router.patch('/sales/:id/cancel', adminMiddleware, adminController.cancelSale)

// ── CATEGORIES ────────────────────────────────────────────────────
router.get('/categories',                       adminMiddleware, adminController.getCategories)
router.post('/categories',                      adminMiddleware, adminController.createCategory)
router.put('/categories/:id',                   adminMiddleware, adminController.updateCategory)
router.delete('/categories/:id',                adminMiddleware, adminController.deleteCategory)
router.post('/categories/:id/games',            adminMiddleware, adminController.addGameToCategory)
router.delete('/categories/:id/games/:gameId',  adminMiddleware, adminController.removeGameFromCategory)

// ── GAMES ─────────────────────────────────────────────────────────
router.get('/games',        adminMiddleware, adminController.getGames)
router.post('/games',       adminMiddleware, adminController.createGame)
router.put('/games/:id',    adminMiddleware, adminController.updateGame)
router.delete('/games/:id', adminMiddleware, adminController.deleteGame)

export default router