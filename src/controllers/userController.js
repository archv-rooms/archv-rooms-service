import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

const getProfile = async (req, res) => {
  try {
    const userId = req.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, data: {}, message: 'Usuário não encontrado.' })
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Perfil carregado com sucesso.'
    })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao carregar perfil.' })
  }
}

const updateAvatarUrl = async (req, res) => {
  try {
    const { avatarUrl } = req.body
    if (!avatarUrl) {
      return res.status(400).json({ success: false, data: {}, message: 'URL do avatar é obrigatória.' })
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl }
    })

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
      message: 'Avatar atualizado com sucesso.'
    })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar avatar.' })
  }
}

const updateAvatarFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: {}, message: 'Nenhum arquivo enviado.' })
    }

    const avatarUrl = `/uploads/${req.file.filename}`

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl }
    })

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
      message: 'Avatar atualizado com sucesso.'
    })
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar avatar.' })
  }
}

export default { getProfile, updateAvatarUrl, updateAvatarFile }