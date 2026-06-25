import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getGlobalRanking = async (req, res) => {
  try {
    const { gameId } = req.query
    const where = gameId ? { gameId: parseInt(gameId) } : {}

    const sessions = await prisma.gameSession.findMany({
      where,
      select: {
        userId: true,
        duration: true,
        startedAt: true,
        endedAt: true,
      }
    })

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
      select: { id: true, name: true, username: true, avatar: true }
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
        user: { select: { id: true, name: true, username: true, avatar: true } },
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

const getPlayerProfile = async (req, res) => {
  try {
    const { username } = req.params
    const currentUserId = req.user?.id

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, name: true, username: true, createdAt: true }
    })

    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' })

    const sessions = await prisma.gameSession.findMany({
      where: { userId: user.id },
      include: { game: { select: { id: true, title: true } } },
      orderBy: { startedAt: 'desc' }
    })

    const withDuration = sessions.map(s => ({
      ...s,
      calc: s.duration ?? (s.endedAt
        ? Math.floor((new Date(s.endedAt) - new Date(s.startedAt)) / 1000)
        : 0)
    })).filter(s => s.calc > 0)

    const bestSession = [...withDuration].sort((a, b) => a.calc - b.calc)[0]

    const gameCount = {}
    for (const s of withDuration) {
      gameCount[s.game.title] = (gameCount[s.game.title] ?? 0) + 1
    }
    const favoriteGame = Object.entries(gameCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const allSessions = await prisma.gameSession.findMany({
      select: { userId: true, duration: true, startedAt: true, endedAt: true }
    })
    const totals = {}
    for (const s of allSessions) {
      const secs = s.duration ?? (s.endedAt
        ? Math.floor((new Date(s.endedAt) - new Date(s.startedAt)) / 1000)
        : 0)
      totals[s.userId] = (totals[s.userId] ?? 0) + secs
    }
    const sorted = Object.entries(totals)
      .filter(([, t]) => t > 0)
      .sort((a, b) => b[1] - a[1])
    const rank = sorted.findIndex(([id]) => parseInt(id) === user.id) + 1

    let commonGames = []
    if (currentUserId && currentUserId !== user.id) {
      const yourSessions = await prisma.gameSession.findMany({
        where: { userId: currentUserId },
        include: { game: { select: { id: true, title: true } } }
      })
      const yourWithDuration = yourSessions.map(s => ({
        ...s,
        calc: s.duration ?? (s.endedAt
          ? Math.floor((new Date(s.endedAt) - new Date(s.startedAt)) / 1000)
          : 0)
      })).filter(s => s.calc > 0)

      const theirGameIds = [...new Set(withDuration.map(s => s.game.id))]
      for (const gameId of theirGameIds) {
        const yourBest = yourWithDuration.filter(s => s.game.id === gameId).sort((a, b) => a.calc - b.calc)[0]
        const theirBest = withDuration.filter(s => s.game.id === gameId).sort((a, b) => a.calc - b.calc)[0]
        if (yourBest && theirBest) {
          commonGames.push({
            gameName: theirBest.game.title,
            yourTime: yourBest.calc,
            theirTime: theirBest.calc
          })
        }
      }
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username || user.name,
        rank: rank || null,
        bestTime: bestSession?.calc || 0,
        totalMatches: withDuration.length,
        totalGames: Object.keys(gameCount).length,
        favoriteGame,
        memberSince: user.createdAt,
        recentMatches: withDuration.slice(0, 10).map(s => ({
          gameName: s.game.title,
          durationSeconds: s.calc,
          playedAt: s.endedAt ?? s.startedAt
        })),
        commonGames
      }
    })

  } catch (error) {
    console.log('ERRO GET PLAYER PROFILE:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

export default { getGlobalRanking, getGameHistory, getGames, getPlayerProfile }