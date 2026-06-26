import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const adminController = {

async getUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, username: true, email: true, role: true, createdAt: true,
      subscriptions: {
        where: { status: 'active' },
        include: { plan: true },
        take: 1
      }
    }
  })
  const mapped = users.map(u => ({
    ...u,
    subscription: u.subscriptions?.[0] ?? null
  }))
  res.json({ success: true, data: mapped })
},

  async setUserRole(req, res) {
    const { role } = req.body
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role inválida.' })
    }
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role }
    })
    res.json({ success: true, data: user })
  },

  async setUserStatus(req, res) {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role }
    })
    res.json({ success: true, data: user })
  },

  async banUser(req, res) {
    const { reason, type, durationHours } = req.body
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Motivo obrigatório.' })
    }
    const data = { role: 'banned' }
    if (type === 'temporary' && durationHours) {
      data.bannedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000)
    }
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data
    })
    res.json({ success: true, data: user })
  },

  async unbanUser(req, res) {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role: 'user' }
    })
    res.json({ success: true, data: user })
  },

  async grantPlan(req, res) {
    const { planId } = req.body
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId obrigatório.' })
    }
    const subscription = await prisma.subscription.create({
      data: {
        userId: Number(req.params.id),
        planId: Number(planId),
        status: 'active'
      },
      include: { plan: true }
    })
    res.status(201).json({ success: true, data: subscription })
  },

  async getPlans(req, res) {
    const plans = await prisma.plan.findMany()
    res.json({ success: true, data: plans })
  },

  async updatePlan(req, res) {
    const { name, price, description, accessLevel } = req.body
    const plan = await prisma.plan.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        price: Number(price),
        description,
        accessLevel: Number(accessLevel ?? 0)
      }
    })
    res.json({ success: true, data: plan })
  },

  async deletePlan(req, res) {
    const id = Number(req.params.id)
    const activeSubscriptions = await prisma.subscription.count({
      where: { planId: id, status: 'active' }
    })
    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Plano possui ${activeSubscriptions} assinatura(s) ativa(s). Cancele-as antes de deletar.`
      })
    }
    await prisma.plan.delete({ where: { id } })
    res.json({ success: true, message: 'Plano deletado com sucesso.' })
  },

  async getSales(req, res) {
    const sales = await prisma.subscription.findMany({
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, price: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: sales })
  },

  async cancelSale(req, res) {
    const id = Number(req.params.id)
    const subscription = await prisma.subscription.findUnique({ where: { id } })
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Assinatura não encontrada.' })
    }
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Assinatura já está cancelada.' })
    }
    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: 'cancelled' }
    })
    res.json({ success: true, data: updated, message: 'Assinatura cancelada com sucesso.' })
  },

  async getCategories(req, res) {
    const categories = await prisma.category.findMany({
      include: { games: { include: { game: true } } }
    })
    res.json({ success: true, data: categories })
  },

  async createCategory(req, res) {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Nome obrigatório.' })
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json({ success: true, data: category })
  },

  async updateCategory(req, res) {
    const { name } = req.body
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name }
    })
    res.json({ success: true, data: category })
  },

  async deleteCategory(req, res) {
    await prisma.category.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  },

  async addGameToCategory(req, res) {
    const { gameId } = req.body
    const relation = await prisma.gameCategory.create({
      data: {
        gameId:     Number(gameId),
        categoryId: Number(req.params.id)
      }
    })
    res.status(201).json({ success: true, data: relation })
  },

  async removeGameFromCategory(req, res) {
    await prisma.gameCategory.delete({
      where: {
        gameId_categoryId: {
          gameId:     Number(req.params.gameId),
          categoryId: Number(req.params.id)
        }
      }
    })
    res.json({ success: true })
  },

  async getGames(req, res) {
    const games = await prisma.game.findMany({ orderBy: { id: 'asc' } })
    res.json({ success: true, data: games })
  },

  async createGame(req, res) {
    const { title, platform, coverUrl, accessLevel, planId } = req.body
    const game = await prisma.game.create({
      data: {
        title,
        console:     platform,
        image:       coverUrl ?? '',
        accessLevel: accessLevel ?? 0,
        planId:      planId ?? null
      }
    })
    res.status(201).json({ success: true, data: game })
  },

  async updateGame(req, res) {
    const { title, platform, coverUrl, accessLevel, planId } = req.body
    const game = await prisma.game.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        console:     platform,
        image:       coverUrl ?? '',
        accessLevel: accessLevel ?? 0,
        planId:      planId ?? null
      }
    })
    res.json({ success: true, data: game })
  },

  async deleteGame(req, res) {
    await prisma.game.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  },

  async createPlan(req, res) {
    const { name, price, description, accessLevel } = req.body
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nome e preço são obrigatórios.' })
    }
    const plan = await prisma.plan.create({
      data: {
        name,
        price:       Number(price),
        description: description ?? '',
        accessLevel: Number(accessLevel ?? 0)
      }
    })
    res.status(201).json({ success: true, data: plan })
  },
}

export default adminController