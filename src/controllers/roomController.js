import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const roomInclude = {
  game: { select: { id: true, title: true, console: true, image: true, fileUrl: true } },
  host: { select: { id: true, name: true, username: true, avatar: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } }
    }
  }
}

function serialize(room, userId) {
  return {
    id: room.id,
    gameId: room.gameId,
    game: room.game.title,
    console: room.game.console,
    image: room.game.image,
    fileUrl: room.game.fileUrl,
    host: room.host.username || room.host.name,
    hostId: room.hostId,
    players: room.members.length,
    maxPlayers: room.maxPlayers,
    joined: room.members.some((m) => m.userId === userId),
    members: room.members.map((m) => m.user),
    createdAt: room.createdAt
  }
}

function notifyChange(req) {
  const io = req.app.get('io')
  if (io) io.emit('rooms_updated')
}

async function listRooms(req, res) {
  try {
    const rooms = await prisma.room.findMany({
      where: { status: 'open' },
      include: roomInclude,
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: { rooms: rooms.map((r) => serialize(r, req.user.id)) } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao buscar salas.' })
  }
}

async function createRoom(req, res) {
  try {
    const userId = req.user.id
    const gameId = Number(req.body.gameId)
    const maxPlayers = Math.min(4, Math.max(2, Number(req.body.maxPlayers) || 2))

    if (!gameId) {
      return res.status(400).json({ success: false, message: 'gameId é obrigatório.' })
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) {
      return res.status(404).json({ success: false, message: 'Jogo não encontrado.' })
    }

    const room = await prisma.room.create({
      data: {
        gameId,
        hostId: userId,
        maxPlayers,
        members: { create: [{ userId }] }
      },
      include: roomInclude
    })

    notifyChange(req)
    res.status(201).json({ success: true, data: { room: serialize(room, userId) } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao criar sala.' })
  }
}

async function joinRoom(req, res) {
  try {
    const userId = req.user.id
    const roomId = Number(req.params.id)

    const room = await prisma.room.findUnique({ where: { id: roomId }, include: roomInclude })
    if (!room || room.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' })
    }

    if (!room.members.some((m) => m.userId === userId)) {
      if (room.members.length >= room.maxPlayers) {
        return res.status(409).json({ success: false, message: 'Sala cheia.' })
      }
      await prisma.roomMember.create({ data: { roomId, userId } })
    }

    const updated = await prisma.room.findUnique({ where: { id: roomId }, include: roomInclude })
    notifyChange(req)
    res.json({ success: true, data: { room: serialize(updated, userId) } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao entrar na sala.' })
  }
}

async function leaveRoom(req, res) {
  try {
    const userId = req.user.id
    const roomId = Number(req.params.id)

    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) {
      return res.json({ success: true, data: { closed: true } })
    }

    if (room.hostId === userId) {
      await prisma.room.delete({ where: { id: roomId } })
      notifyChange(req)
      return res.json({ success: true, data: { closed: true } })
    }

    await prisma.roomMember.deleteMany({ where: { roomId, userId } })
    notifyChange(req)
    res.json({ success: true, data: { closed: false } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao sair da sala.' })
  }
}

export default { listRooms, createRoom, joinRoom, leaveRoom }