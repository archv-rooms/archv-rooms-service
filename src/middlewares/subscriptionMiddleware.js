import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const subscriptionMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })

    if (!activeSubscription) {
      return res.status(403).json({ 
        success: false, 
        data: {}, 
        message: 'Acesso negado. Assinatura ativa necessária.' 
      })
    }

    req.accessLevel = activeSubscription.plan.accessLevel
    return next()
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      data: {}, 
      message: 'Erro ao verificar assinatura.' 
    })
  }
}

export default subscriptionMiddleware