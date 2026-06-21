import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getConversations(req, res) {
  try {
    const userId = req.user.id

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ success: true, data: { conversations } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao buscar conversas.' })
  }
}

async function getOrCreateDirectConversation(req, res) {
  try {
    const userId = req.user.id
    const { friendId } = req.body

    if (!friendId) {
      return res.status(400).json({ success: false, message: 'friendId é obrigatório.' })
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: friendId } } }
        ]
      },
      include: { participants: true }
    })

    if (existing) {
      return res.json({ success: true, data: { conversation: existing } })
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: 'direct',
        participants: {
          create: [
            { userId },
            { userId: friendId }
          ]
        }
      },
      include: { participants: true }
    })

    res.json({ success: true, data: { conversation } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao criar conversa.' })
  }
}

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params

    const messages = await prisma.message.findMany({
      where: { conversationId: Number(conversationId) },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json({ success: true, data: { messages } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao buscar mensagens.' })
  }
}

async function sendMessage(req, res) {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Mensagem vazia.' })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: userId,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } }
      }
    })

    const io = req.app.get('io')
    io.to(`conversation_${conversationId}`).emit('new_message', message)

    res.json({ success: true, data: { message } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' })
  }
}

export default {
  getConversations,
  getOrCreateDirectConversation,
  getMessages,
  sendMessage
}