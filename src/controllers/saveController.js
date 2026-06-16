import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getSaves = async (req, res) => {
  try {
    const userId = req.userId
    const gameId = Number(req.params.gameId)

    const saves = await prisma.gameSave.findMany({
      where: { userId, gameId },
      orderBy: { slot: 'asc' }
    })

    res.status(200).json({ success: true, data: saves, message: 'Saves carregados.' })
  } catch (error) {
    console.error('[getSaves]', error)
    res.status(500).json({ success: false, data: {}, message: error.message })
  }
}

export const upsertSave = async (req, res) => {
  try {
    const userId = req.userId
    const gameId = Number(req.params.gameId)
    const { slot = 1, saveData } = req.body

    if (!saveData) {
      return res.status(400).json({ success: false, data: {}, message: 'saveData é obrigatório.' })
    }

    const save = await prisma.gameSave.upsert({
      where: { userId_gameId_slot: { userId, gameId, slot } },
      update: { saveData },
      create: { userId, gameId, slot, saveData }
    })

    res.status(200).json({ success: true, data: save, message: 'Save sincronizado.' })
  } catch (error) {
    console.error('[upsertSave]', error)
    res.status(500).json({ success: false, data: {}, message: error.message })
  }
}