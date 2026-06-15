import { PrismaClient } from '@prisma/client'
import { Preference } from 'mercadopago'
import mpClient from '../config/mercadopago.js'
import emailService from '../config/emailService.js'

const prisma = new PrismaClient()

const checkout = async (req, res) => {
  try {
    const userId = req.userId
    const { planId: planIdRaw } = req.body
    const planId = parseInt(planIdRaw)

    if (isNaN(planId) || !planId) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'O ID do plano é obrigatório e deve ser um número inteiro.'
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    const preference = new Preference(mpClient)
    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: String(plan.id),
            title: `Archv Rooms — Plano ${plan.name}`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'BRL'
          }
        ],
        payer: {
          email: user.email,
          name: user.name
        },
        payment_methods: {
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ]
        },
        metadata: {
          userId,
          planId
        },
        notification_url: `${process.env.BACKEND_URL}/webhook/mercadopago`,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: 'approved'
      }
    })

    return res.status(200).json({
      success: true,
      data: {
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point
      },
      message: 'Preferência de pagamento criada com sucesso.'
    })
  } catch (error) {
    console.error('ERRO CHECKOUT:', error)
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

export default { checkout }