import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const adminController = {

  // Listar todos os usuários
  async getUsers(req, res) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    res.json({ success: true, data: users })
  },

  // Alterar role do usuário (admin/user)
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

  // Listar planos
  async getPlans(req, res) {
    const plans = await prisma.plan.findMany()
    res.json({ success: true, data: plans })
  },

  // Editar plano (nome, preço)
  async updatePlan(req, res) {
    const { name, price, description } = req.body
    const plan = await prisma.plan.update({
      where: { id: Number(req.params.id) },
      data: { name, price, description }
    })
    res.json({ success: true, data: plan })
  },

  // Listar vendas (subscriptions)
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

  // Ativar/desativar usuário (via role ou campo extra)
  async setUserStatus(req, res) {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role }
    })
    res.json({ success: true, data: user })
  },

  // Listar categorias
  async getCategories(req, res) {
    const categories = await prisma.category.findMany({
      include: { games: { include: { game: true } } }
    })
    res.json({ success: true, data: categories })
  },

  // Criar categoria
  async createCategory(req, res) {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Nome obrigatório.' })
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json({ success: true, data: category })
  },

  // Editar categoria
  async updateCategory(req, res) {
    const { name } = req.body
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name }
    })
    res.json({ success: true, data: category })
  },

  // Deletar categoria
  async deleteCategory(req, res) {
    await prisma.category.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  },

  // Associar jogo a categoria
  async addGameToCategory(req, res) {
    const { gameId } = req.body
    const relation = await prisma.gameCategory.create({
      data: {
        gameId: Number(gameId),
        categoryId: Number(req.params.id)
      }
    })
    res.status(201).json({ success: true, data: relation })
  },

  // Remover jogo de categoria
  async removeGameFromCategory(req, res) {
    await prisma.gameCategory.delete({
      where: {
        gameId_categoryId: {
          gameId: Number(req.params.gameId),
          categoryId: Number(req.params.id)
        }
      }
    })
    res.json({ success: true })
  }

}

export default adminController