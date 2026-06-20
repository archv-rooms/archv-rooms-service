import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Buscar notificações do usuário
const getNotifications = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    })

    res.status(200).json({ success: true, data: notifications, message: 'Notificações listadas.' })
  } catch (error) {
    console.log('ERRO GET NOTIFICATIONS:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Contar não lidas
const getUnreadCount = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    const count = await prisma.notification.count({
      where: { userId, read: false }
    })

    res.status(200).json({ success: true, data: { count }, message: 'Contagem obtida.' })
  } catch (error) {
    console.log('ERRO GET UNREAD COUNT:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Marcar uma como lida
const markAsRead = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)
    const { id } = req.params

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    })

    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ success: false, data: {}, message: 'Ação não permitida.' })
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    })

    res.status(200).json({ success: true, data: {}, message: 'Notificação marcada como lida.' })
  } catch (error) {
    console.log('ERRO MARK AS READ:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Marcar todas como lidas
const markAllAsRead = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })

    res.status(200).json({ success: true, data: {}, message: 'Todas marcadas como lidas.' })
  } catch (error) {
    console.log('ERRO MARK ALL AS READ:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Deletar uma notificação
const deleteNotification = async (req, res) => {
  try {
    const userId = parseInt(req.user.id)
    const { id } = req.params

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    })

    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ success: false, data: {}, message: 'Ação não permitida.' })
    }

    await prisma.notification.delete({ where: { id: parseInt(id) } })
    res.status(200).json({ success: true, data: {}, message: 'Notificação deletada.' })
  } catch (error) {
    console.log('ERRO DELETE NOTIFICATION:', error)
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' })
  }
}

// Função interna para criar notificação (usada por outros controllers)
export const createNotification = async ({ userId, type, title, body, data }) => {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, data: data ?? {} }
    })
  } catch (error) {
    console.log('ERRO CREATE NOTIFICATION:', error)
  }
}

export default { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification }