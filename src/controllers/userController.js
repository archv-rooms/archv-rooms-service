import { PrismaClient } from '@prisma/client'

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

export default {
  getProfile
}