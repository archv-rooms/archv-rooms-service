import express from 'express'
import gameController from '../controllers/gameController.js'

const router = express.Router()

router.get('/', gameController.getGames)
router.post('/', gameController.createGame)
router.put('/:id', gameController.updateGame)
router.delete('/:id', gameController.deleteGame)

export default router