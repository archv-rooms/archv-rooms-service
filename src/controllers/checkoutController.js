import { PrismaClient } from '@prisma/client'
import emailService from '../config/emailService.js'

const prisma = new PrismaClient()

const checkout = async (req, res) => {
  try {
    const userId = req.userId
    const { planId: planIdRaw } = req.body
    const planId = parseInt(planIdRaw)

    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'O ID do plano deve ser um número inteiro, não string.'
      })
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'O ID do plano é obrigatório.'
      })
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Plano não encontrado.'
      })
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' }
    })

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Usuário já possui uma assinatura ativa.'
      })
    }

    const subscription = await prisma.subscription.create({
      data: { userId, planId, status: 'ACTIVE' },
      include: { plan: true }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    await emailService.sendPaymentConfirmationEmail(user.email, user.name, plan.name)

    res.status(201).json({
      success: true,
      data: { subscription },
      message: 'Assinatura realizada com sucesso.'
    })
  } catch (error) {
    console.log('ERRO CHECKOUT:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

export default { checkout }