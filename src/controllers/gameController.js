import { PrismaClient } from '@prisma/client'
import cloudinary from '../config/cloudinary.js'
import streamifier from 'streamifier'

const prisma = new PrismaClient()

const getGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany()
    res.status(200).json({ success: true, data: games, message: 'Jogos carregados.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, data: {}, message: error.message })
  }
}

const getGameById = async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!game) {
      return res.status(404).json({ success: false, data: {}, message: 'Jogo não encontrado.' })
    }

    res.status(200).json({ success: true, data: game, message: 'Jogo carregado.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, data: {}, message: error.message })
  }
}

const createGame = async (req, res) => {
  try {
    const { title, platform, coverUrl, accessLevel, planId } = req.body

    const game = await prisma.game.create({
      data: {
        title,
        console: platform,
        image: coverUrl,
        accessLevel: accessLevel ?? 0,
        planId: planId ?? null
      }
    })
    res.status(201).json({ success: true, data: game, message: 'Jogo criado.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao criar jogo.' })
  }
}

const updateGame = async (req, res) => {
  try {
    const { title, platform, coverUrl, accessLevel, planId } = req.body

    const game = await prisma.game.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        console: platform,
        image: coverUrl,
        accessLevel: accessLevel ?? 0,
        planId: planId ?? null
      }
    })
    res.status(200).json({ success: true, data: game, message: 'Jogo atualizado.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao atualizar jogo.' })
  }
}

const deleteGame = async (req, res) => {
  try {
    await prisma.game.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json({ success: true, data: {}, message: 'Jogo deletado.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, data: {}, message: 'Erro ao deletar jogo.' })
  }
}

const updateGameImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      data: {},
      message: 'Nenhuma imagem enviada.'
    })
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'archv-rooms/games'
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve(result)
        }
      )

      streamifier.createReadStream(req.file.buffer).pipe(stream)
    })

    const game = await prisma.game.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        image: result.secure_url
      }
    })

    res.status(200).json({
      success: true,
      data: game,
      message: 'Imagem do jogo atualizada.'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro ao atualizar imagem do jogo.'
    })
  }
}

export default {
 getGames,
  getGameById,
  createGame,
  updateGame,
  updateGameImage,
  deleteGame
}