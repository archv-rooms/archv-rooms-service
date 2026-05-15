import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany()
    res.status(200).json({ success: true, data: games, message: 'Jogos carregados.' })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar jogos.' })
  }
}

const createGame = async (req, res) => {
  try {
    const game = await prisma.game.create({ data: req.body })
    res.status(201).json({ success: true, data: game, message: 'Jogo criado.' })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao criar jogo.' })
  }
}

const updateGame = async (req, res) => {
  try {
    const game = await prisma.game.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.status(200).json({ success: true, data: game, message: 'Jogo atualizado.' })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar jogo.' })
  }
}

const deleteGame = async (req, res) => {
  try {
    await prisma.game.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json({ success: true, data: {}, message: 'Jogo deletado.' })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao deletar jogo.' })
  }
}

export default { getGames, createGame, updateGame, deleteGame }