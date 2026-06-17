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

export default {
  getProfile,
  updateName,
  updateAvatarUrl,
  updateAvatarFile,
  completeOnboarding,
  getPaymentHistory,
  toggleFavorite,
  getFavorites
}