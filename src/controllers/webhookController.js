import { PrismaClient } from '@prisma/client'
import { Payment } from 'mercadopago'
import mpClient from '../config/mercadopago.js'
import emailService from '../config/emailService.js'

const prisma = new PrismaClient()

const handleMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.body

    if (type !== 'payment') {
      return res.sendStatus(200)
    }

    const paymentId = data?.id
    if (!paymentId) {
      return res.sendStatus(200)
    }

    const paymentClient = new Payment(mpClient)
    const payment = await paymentClient.get({ id: paymentId })

    if (payment.status !== 'approved') {
      return res.sendStatus(200)
    }

    const { userId, planId } = payment.metadata

    if (!userId || !planId) {
      console.error('Webhook sem metadata userId/planId:', payment.metadata)
      return res.sendStatus(200)
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId: Number(userId), status: 'ACTIVE' }
    })

    if (existing) {
      return res.sendStatus(200)
    }

    await prisma.subscription.create({
      data: {
        userId: Number(userId),
        planId: Number(planId),
        status: 'ACTIVE'
      }
    })

    const [user, plan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { email: true, name: true }
      }),
      prisma.plan.findUnique({
        where: { id: Number(planId) },
        select: { name: true }
      })
    ])

    if (user && plan) {
      await emailService.sendPaymentConfirmationEmail(user.email, user.name, plan.name)
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error('ERRO WEBHOOK MP:', error)
    return res.sendStatus(500)
  }
}

export default { handleMercadoPago }