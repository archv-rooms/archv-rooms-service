import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Iniciar sessão
const startSession = async (req, res) => {
  try {
    const { gameId } = req.body
    const userId = req.userId

    if (!gameId) {
      return res.status(400).json({ success: false, data: {}, message: 'gameId é obrigatório.' })
    }

    const session = await prisma.gameSession.create({
      data: { userId, gameId }
    })

    res.status(201).json({ success: true, data: { session }, message: 'Sessão iniciada.' })
  } catch (error) {
    console.log('ERRO START SESSION:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Encerrar sessão
const endSession = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const session = await prisma.gameSession.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!session) {
      return res.status(404).json({ success: false, data: {}, message: 'Sessão não encontrada.' })
    }

    const endedAt = new Date()
    const duration = Math.floor((endedAt - session.startedAt) / 1000)

    const updated = await prisma.gameSession.update({
      where: { id: parseInt(id) },
      data: { endedAt, duration }
    })

    res.status(200).json({ success: true, data: { session: updated }, message: 'Sessão encerrada.' })
  } catch (error) {
    console.log('ERRO END SESSION:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Histórico do usuário
const getHistory = async (req, res) => {
  try {
    const userId = req.userId

    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        game: {
          select: { id: true, title: true, console: true, image: true }
        }
      }
    })

    res.status(200).json({ success: true, data: { sessions }, message: 'Histórico carregado.' })
  } catch (error) {
    console.log('ERRO GET HISTORY:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

export default { startSession, endSession, getHistory }