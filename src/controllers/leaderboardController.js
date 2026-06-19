import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getGlobalRanking = async (req, res) => {
  try {
    const { gameId } = req.query

    const where = gameId ? { gameId: parseInt(gameId) } : {}

    const sessions = await prisma.gameSession.groupBy({
      by: ['userId'],
      where,
      _sum: { duration: true },
      orderBy: { _sum: { duration: 'desc' } },
      take: 50
    })

    const usersIds = sessions.map(s => s.userId)

    const users = await prisma.user.findMany({
      where: { id: { in: usersIds } },
      select: { id: true, name: true, avatar: true }
    })

    const ranking = sessions.map((s, index) => {
      const user = users.find(u => u.id === s.userId)
      return {
        position: index + 1,
        user,
        totalDuration: s._sum.duration ?? 0
      }
    })

    res.status(200).json({ success: true, data: { ranking }, message: 'Ranking global.' })
  } catch (error) {
    console.log('ERRO GET GLOBAL RANKING:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const getGameHistory = async (req, res) => {
  try {
    const { gameId } = req.query
    const where = gameId ? { gameId: parseInt(gameId) } : {}

    const sessions = await prisma.gameSession.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        game: { select: { id: true, title: true, console: true, image: true } }
      },
      orderBy: { startedAt: 'desc' },
      take: 100
    })

    res.status(200).json({ success: true, data: { sessions }, message: 'Histórico de partidas.' })
  } catch (error) {
    console.log('ERRO GET GAME HISTORY:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const getGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      select: { id: true, title: true, console: true, image: true },
      orderBy: { title: 'asc' }
    })

    res.status(200).json({ success: true, data: { games }, message: 'Jogos listados.' })
  } catch (error) {
    console.log('ERRO GET GAMES:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

export default { getGlobalRanking, getGameHistory, getGames }