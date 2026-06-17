import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/admin/theme — público
router.get('/theme', async (req, res) => {
  try {
    const config = await prisma.globalConfig.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, themeKey: 'default' },
    })
    res.json({ themeKey: config.themeKey })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch theme' })
  }
})

// POST /api/admin/theme — só admin
router.post('/theme', async (req, res) => {
  const { themeKey } = req.body
  if (!themeKey || typeof themeKey !== 'string') {
    return res.status(400).json({ error: 'themeKey is required' })
  }
  try {
    const config = await prisma.globalConfig.upsert({
      where: { id: 1 },
      update: { themeKey },
      create: { id: 1, themeKey },
    })
    res.json({ themeKey: config.themeKey })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme' })
  }
})

export default router