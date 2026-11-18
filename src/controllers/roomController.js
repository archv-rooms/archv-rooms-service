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

// Estado temporário das salas (pronto, chat, início). Some se o servidor reiniciar.
const runtime = new Map()

function getRuntime(roomId) {
  if (!runtime.has(roomId)) {
    runtime.set(roomId, { ready: new Set(), startedAt: null, messages: [], nextId: 1 })
  }
  return runtime.get(roomId)
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
    isHost: room.hostId === userId,
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
      runtime.delete(roomId)
      return res.json({ success: true, data: { closed: true } })
    }

    if (room.hostId === userId) {
      await prisma.room.delete({ where: { id: roomId } })
      runtime.delete(roomId)
      notifyChange(req)
      return res.json({ success: true, data: { closed: true } })
    }

    await prisma.roomMember.deleteMany({ where: { roomId, userId } })
    getRuntime(roomId).ready.delete(userId)
    notifyChange(req)
    res.json({ success: true, data: { closed: false } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao sair da sala.' })
  }
}

// ─── Lobby: estado, pronto, chat e início ─────────────────

async function loadMemberRoom(req, res) {
  const roomId = Number(req.params.id)
  const room = await prisma.room.findUnique({ where: { id: roomId }, include: roomInclude })
  if (!room) {
    res.status(404).json({ success: false, message: 'Sala não encontrada.' })
    return null
  }
  if (!room.members.some((m) => m.userId === req.user.id)) {
    res.status(403).json({ success: false, message: 'Você não está nesta sala.' })
    return null
  }
  return room
}

function statePayload(room, userId) {
  const rt = getRuntime(room.id)
  return {
    room: serialize(room, userId),
    me: userId,
    ready: [...rt.ready],
    startedAt: rt.startedAt,
    messages: rt.messages
  }
}

async function getState(req, res) {
  try {
    const room = await loadMemberRoom(req, res)
    if (!room) return
    res.json({ success: true, data: statePayload(room, req.user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao buscar a sala.' })
  }
}

async function setReady(req, res) {
  try {
    const room = await loadMemberRoom(req, res)
    if (!room) return
    const rt = getRuntime(room.id)
    if (req.body.ready) rt.ready.add(req.user.id)
    else rt.ready.delete(req.user.id)
    res.json({ success: true, data: statePayload(room, req.user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao marcar pronto.' })
  }
}

async function sendRoomMessage(req, res) {
  try {
    const room = await loadMemberRoom(req, res)
    if (!room) return
    const content = String(req.body.content || '').trim().slice(0, 300)
    if (!content) {
      return res.status(400).json({ success: false, message: 'Mensagem vazia.' })
    }
    const me = room.members.find((m) => m.userId === req.user.id).user
    const rt = getRuntime(room.id)
    rt.messages.push({
      id: rt.nextId++,
      userId: me.id,
      from: me.username || me.name,
      text: content,
      createdAt: new Date().toISOString()
    })
    if (rt.messages.length > 50) rt.messages.shift()
    res.json({ success: true, data: statePayload(room, req.user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' })
  }
}

async function startRoom(req, res) {
  try {
    const room = await loadMemberRoom(req, res)
    if (!room) return
    if (room.hostId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Só o dono pode iniciar.' })
    }
    const rt = getRuntime(room.id)
    const others = room.members.filter((m) => m.userId !== room.hostId)
    if (others.length < 1) {
      return res.status(400).json({ success: false, message: 'Aguarde outro jogador entrar.' })
    }
    if (!others.every((m) => rt.ready.has(m.userId))) {
      return res.status(400).json({ success: false, message: 'Nem todos estão prontos.' })
    }
    rt.startedAt = Date.now()
    rt.ready.clear()
    res.json({ success: true, data: statePayload(room, req.user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao iniciar.' })
  }
}

export default {
  listRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  getState,
  setReady,
  sendRoomMessage,
  startRoom
}