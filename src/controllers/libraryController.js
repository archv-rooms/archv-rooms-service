import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getLibrary = async (req, res) => {
  try {
    const games = await prisma.game.findMany()

    res.status(200).json({
      success: true,
      data: { games },
      message: 'Biblioteca carregada com sucesso.'
    })
  } catch (error) {
    console.error('[getLibrary]', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro ao carregar a biblioteca.'
    })
  }
}

export default {
  getLibrary
}