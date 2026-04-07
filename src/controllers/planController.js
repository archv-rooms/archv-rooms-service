const prisma = require('@prisma/client');

exports.getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany();
    res.status(200).json({ success: true, data: { plans }, message: 'Planos recuperados com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao buscar planos.' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId;

    // Cancela assinaturas ativas anteriores
    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' }
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: Number(planId),
        status: 'ACTIVE'
      }
    });

    res.status(201).json({ success: true, data: { subscription }, message: 'Assinatura realizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro ao processar assinatura.' });
  }
};
