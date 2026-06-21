import { PrismaClient } from '@prisma/client'
import { createNotification } from './notificationController.js'

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

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { username: true }
    })

    await createNotification({
      userId: receiverIdInt,
      type: 'friend_request',
      title: 'Novo convite de amizade',
      body: `${sender?.username ?? 'Alguém'} quer ser seu amigo.`,
      data: { friendshipId: friendship.id, senderId }
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

    if (status === 'accepted') {
      const receiver = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      })

      await createNotification({
        userId: friendship.senderId,
        type: 'friend_accepted',
        title: 'Convite aceito!',
        body: `${receiver?.username ?? 'Alguém'} aceitou seu convite de amizade.`,
        data: { friendshipId: friendship.id, receiverId: userId }
      })
    }

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

    const friends = friendships.map(f => {
      const user = f.senderId === userId ? f.receiver : f.sender
      return { ...user, friendshipId: f.id }
    })

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
        username: { contains: q },
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

const getFriendsActivity = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    // busca todos os amigos
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          { status: 'accepted' },
          { OR: [{ senderId: userId }, { receiverId: userId }] }
        ]
      },
      select: { senderId: true, receiverId: true }
    })

    const friendIds = friendships.map(f =>
      f.senderId === userId ? f.receiverId : f.senderId
    )

    if (friendIds.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'Nenhum amigo.' })
    }

    // busca a sessão mais recente de cada amigo
    const activities = await Promise.all(
      friendIds.map(async (friendId) => {
        const user = await prisma.user.findUnique({
          where: { id: friendId },
          select: { id: true, username: true, avatar: true }
        })

        // sessão ativa (jogando agora)
        const activeSession = await prisma.gameSession.findFirst({
          where: { userId: friendId, endedAt: null },
          include: { game: { select: { id: true, title: true, console: true, image: true } } },
          orderBy: { startedAt: 'desc' }
        })

        if (activeSession) {
          return {
            user,
            status: 'playing',
            game: activeSession.game,
            since: activeSession.startedAt
          }
        }

        // última sessão encerrada
        const lastSession = await prisma.gameSession.findFirst({
          where: { userId: friendId, endedAt: { not: null } },
          include: { game: { select: { id: true, title: true, console: true, image: true } } },
          orderBy: { endedAt: 'desc' }
        })

        if (lastSession) {
          return {
            user,
            status: 'last_played',
            game: lastSession.game,
            since: lastSession.endedAt,
            duration: lastSession.duration
          }
        }

        return {
          user,
          status: 'inactive',
          game: null,
          since: null
        }
      })
    )

    res.status(200).json({ success: true, data: activities, message: 'Atividade dos amigos.' })
  } catch (error) {
    console.log('ERRO GET FRIENDS ACTIVITY:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

export default {
  sendFriendRequest,
  respondFriendRequest,
  getFriends,
  getPendingRequests,
  searchUsers,
  removeFriend,
  getFriendsActivity
}