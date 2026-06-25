import express from 'express'
import leaderboardController from '../controllers/leaderboardController.js'
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware.js'

const router = express.Router()

router.get('/ranking', optionalAuthMiddleware, leaderboardController.getGlobalRanking)
router.get('/history', optionalAuthMiddleware, leaderboardController.getGameHistory)
router.get('/games', optionalAuthMiddleware, leaderboardController.getGames)
router.get('/profile/:username', optionalAuthMiddleware, leaderboardController.getPlayerProfile)

export default router