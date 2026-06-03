import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const subscriptionMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId

    const activeSubscription = await prisma.subscription.findFirst({
      where:   { userId, status: 'ACTIVE' },
      include: { plan: true }
    })

    if (!activeSubscription) {
      // Usuário autenticado mas sem plano ativo → acessa com nível 0 (tier FREE)
      req.accessLevel = 0
      return next()
    }

    req.accessLevel = activeSubscription.plan.accessLevel
    return next()
  } catch (error) {
    console.error('[subscriptionMiddleware]', error)
    return res.status(500).json({ success: false, data: {}, message: 'Erro ao verificar assinatura.' })
  }
}

export default subscriptionMiddleware
