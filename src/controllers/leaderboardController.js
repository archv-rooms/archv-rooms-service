import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getGlobalRanking = async (req, res) => {
  try {
    const { gameId } = req.query
    const where = gameId ? { gameId: parseInt(gameId) } : {}

    // Busca sessões com startedAt e endedAt para calcular duration quando nulo
    const sessions = await prisma.gameSession.findMany({
      where,
      select: {
        userId: true,
        duration: true,
        startedAt: true,
        endedAt: true,
      }
    })

    // Agrupa por userId somando duration (ou calculando por endedAt - startedAt)
    const totals = {}
    for (const s of sessions) {
      const secs = s.duration
        ?? (s.endedAt
          ? Math.floor((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000)
          : 0)
      totals[s.userId] = (totals[s.userId] ?? 0) + secs
    }

    const sorted = Object.entries(totals)
      .map(([userId, total]) => ({ userId: parseInt(userId), total }))
      .filter(e => e.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 50)

    const users = await prisma.user.findMany({
      where: { id: { in: sorted.map(e => e.userId) } },
      select: { id: true, name: true, avatar: true }
    })

    const ranking = sorted.map((e, index) => {
      const user = users.find(u => u.id === e.userId)
      return {
        position: index + 1,
        user,
        totalDuration: e.total
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