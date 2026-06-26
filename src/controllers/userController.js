import { PrismaClient } from '@prisma/client'
import cloudinary from '../config/cloudinary.js'
import streamifier from 'streamifier'

const prisma = new PrismaClient()

// GET /user/profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id:        true,
        name:      true,
        username:  true,
        email:     true,
        avatar:    true,
        createdAt: true,
        onboardingDone: true,
        subscriptions: {
          where:   { status: 'ACTIVE' },
          include: { plan: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, data: {}, message: 'Usuário não encontrado.' })
    }

    res.status(200).json({ success: true, data: { user }, message: 'Perfil carregado com sucesso.' })
  } catch (error) {
    console.error('[getProfile]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar perfil.' })
  }
}

// PATCH /user/name
const updateName = async (req, res) => {
  try {
    const { name } = req.body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, data: {}, message: 'Nome inválido. Mínimo de 2 caracteres.' })
    }

    const trimmed = name.trim()

    const user = await prisma.user.update({
      where: { id: req.userId },
      data:  { name: trimmed },
      select: { id: true, name: true }
    })

    res.status(200).json({ success: true, data: { name: user.name }, message: 'Nome atualizado com sucesso.' })
  } catch (error) {
    console.error('[updateName]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar nome.' })
  }
}

// PATCH /user/avatar-url
const updateAvatarUrl = async (req, res) => {
  try {
    const { avatarUrl } = req.body
    if (!avatarUrl) {
      return res.status(400).json({ success: false, data: {}, message: 'URL do avatar é obrigatória.' })
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data:  { avatar: avatarUrl }
    })

    res.status(200).json({ success: true, data: { avatar: user.avatar }, message: 'Avatar atualizado com sucesso.' })
  } catch (error) {
    console.error('[updateAvatarUrl]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar avatar.' })
  }
}

// PATCH /user/avatar-file
const updateAvatarFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, data: {}, message: 'Nenhum arquivo enviado.' })
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'archv-rooms/avatars' },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve(result)
        }
      )
      streamifier.createReadStream(req.file.buffer).pipe(stream)
    })

    const user = await prisma.user.update({
      where: { id: req.userId },
      data:  { avatar: result.secure_url }
    })

    res.status(200).json({ success: true, data: { avatar: user.avatar }, message: 'Avatar atualizado com sucesso.' })
  } catch (error) {
    console.error('[updateAvatarFile]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao fazer upload do avatar.' })
  }
}

// PATCH /user/onboarding
const completeOnboarding = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data:  { onboardingDone: true }
    })

    res.status(200).json({ success: true, data: {}, message: 'Onboarding concluído.' })
  } catch (error) {
    console.error('[completeOnboarding]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao concluir onboarding.' })
  }
}

// GET /user/payments
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    })

    res.status(200).json({ success: true, data: { payments }, message: 'Histórico carregado.' })
  } catch (error) {
    console.error('[getPaymentHistory]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar histórico.' })
  }
}

// POST /user/favorites/:gameId
const toggleFavorite = async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId, 10)

    if (!gameId) {
      return res.status(400).json({ success: false, data: {}, message: 'ID do jogo inválido.' })
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_gameId: { userId: req.userId, gameId } }
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return res.status(200).json({ success: true, data: { favorited: false }, message: 'Jogo removido dos favoritos.' })
    }

    await prisma.favorite.create({ data: { userId: req.userId, gameId } })
    return res.status(200).json({ success: true, data: { favorited: true }, message: 'Jogo adicionado aos favoritos.' })
  } catch (error) {
    console.error('[toggleFavorite]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar favorito.' })
  }
}

// GET /user/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: { game: true }
    })

    const games = favorites.map(f => f.game)

    res.status(200).json({ success: true, data: { games }, message: 'Favoritos carregados.' })
  } catch (error) {
    console.error('[getFavorites]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar favoritos.' })
  }
}

// GET /user/:id/public-profile
const getPublicProfile = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10)
    const requesterId = req.userId

    if (!targetId) {
      return res.status(400).json({ success: false, data: {}, message: 'ID inválido.' })
    }

    // Só permite ver perfil de quem é amigo (status accepted, em qualquer direção)
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { senderId: requesterId, receiverId: targetId },
          { senderId: targetId, receiverId: requesterId }
        ]
      }
    })

    if (!friendship && requesterId !== targetId) {
      return res.status(403).json({ success: false, data: {}, message: 'Você só pode ver o perfil de amigos.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, data: {}, message: 'Usuário não encontrado.' })
    }

    const sessions = await prisma.gameSession.findMany({
      where: { userId: targetId, endedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      include: {
        game: { select: { id: true, title: true, console: true, image: true } }
      }
    })

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)

    const gameMap = {}
    for (const s of sessions) {
      if (!s.game) continue
      const key = s.game.id
      if (!gameMap[key]) {
        gameMap[key] = { game: s.game, totalSeconds: 0, sessionCount: 0 }
      }
      gameMap[key].totalSeconds += s.duration || 0
      gameMap[key].sessionCount += 1
    }

    const topGames = Object.values(gameMap)
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .slice(0, 5)

    const recentSessions = sessions.slice(0, 5)

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalSeconds,
          totalSessions: sessions.length,
          uniqueGames: Object.keys(gameMap).length
        },
        topGames,
        recentSessions
      },
      message: 'Perfil carregado.'
    })
  } catch (error) {
    console.error('[getPublicProfile]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar perfil.' })
  }
}

// PATCH /user/username
const setUsername = async (req, res) => {
  try {
    const { username } = req.body

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ success: false, data: {}, message: 'Username inválido. Mínimo de 3 caracteres.' })
    }

    const trimmed = username.trim().toLowerCase()

    const exists = await prisma.user.findUnique({ where: { username: trimmed } })
    if (exists && exists.id !== req.userId) {
      return res.status(400).json({ success: false, data: {}, message: 'Username já em uso.' })
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data:  { username: trimmed },
      select: { id: true, username: true }
    })

    res.status(200).json({ success: true, data: { username: user.username }, message: 'Username definido com sucesso.' })
  } catch (error) {
    console.error('[setUsername]', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao definir username.' })
  }
}

export default {
  getProfile,
  updateName,
  setUsername,
  updateAvatarUrl,
  updateAvatarFile,
  completeOnboarding,
  getPaymentHistory,
  toggleFavorite,
  getFavorites,
  getPublicProfile
}