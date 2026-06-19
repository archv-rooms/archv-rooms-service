import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = parseInt(req.user.id)
    const { receiverId } = req.body
    const receiverIdInt = parseInt(receiverId)

    if (senderId === receiverIdInt) {
      return res.status(400).json({ success: false, data: {}, message: 'Você não pode se adicionar.' })
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiverIdInt },
          { senderId: receiverIdInt, receiverId: senderId }
        ]
      }
    })

    if (existing) {
      return res.status(400).json({ success: false, data: {}, message: 'Convite já existe.' })
    }

    const friendship = await prisma.friendship.create({
      data: { senderId, receiverId: receiverIdInt }
    })

    res.status(201).json({ success: true, data: { friendship }, message: 'Convite enviado!' })
  } catch (error) {
    console.log('ERRO SEND FRIEND REQUEST:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const respondFriendRequest = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)
    const { id } = req.params
    const { status } = req.body

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(id) }
    })

    if (!friendship || friendship.receiverId !== userId) {
      return res.status(403).json({ success: false, data: {}, message: 'Ação não permitida.' })
    }

    const updated = await prisma.friendship.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    res.status(200).json({ success: true, data: { updated }, message: `Convite ${status}.` })
  } catch (error) {
    console.log('ERRO RESPOND FRIEND REQUEST:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const getFriends = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          { status: 'accepted' },
          { OR: [{ senderId: userId }, { receiverId: userId }] }
        ]
      },
      include: {
        sender: { select: { id: true, username: true, email: true, avatar: true } },
        receiver: { select: { id: true, username: true, email: true, avatar: true } }
      }
    })

    const friends = friendships.map(f =>
      f.senderId === userId ? f.receiver : f.sender
    )

    res.status(200).json({ success: true, data: friends, message: 'Amigos listados.' })
  } catch (error) {
    console.log('ERRO GET FRIENDS:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const getPendingRequests = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    const pending = await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: {
        sender: { select: { id: true, username: true, email: true, avatar: true } }
      }
    })

    res.status(200).json({ success: true, data: pending, message: 'Convites pendentes.' })
  } catch (error) {
    console.log('ERRO GET PENDING:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const searchUsers = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, data: [], message: 'Query muito curta.' })
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: 'insensitive' },
        NOT: { id: userId }
      },
      select: { id: true, username: true, email: true, avatar: true },
      take: 10
    })

    res.status(200).json({ success: true, data: users, message: 'Usuários encontrados.' })
  } catch (error) {
    console.log('ERRO SEARCH USERS:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

const removeFriend = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)
    const { id } = req.params

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(id) }
    })

    if (!friendship || (friendship.senderId !== userId && friendship.receiverId !== userId)) {
      return res.status(403).json({ success: false, data: {}, message: 'Ação não permitida.' })
    }

    await prisma.friendship.delete({ where: { id: parseInt(id) } })
    res.status(200).json({ success: true, data: {}, message: 'Amigo removido.' })
  } catch (error) {
    console.log('ERRO REMOVE FRIEND:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

export default { sendFriendRequest, respondFriendRequest, getFriends, getPendingRequests, searchUsers, removeFriend }