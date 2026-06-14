import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ success: false, data: {}, message: 'Token não fornecido.' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2) {
    return res.status(401).json({ success: false, data: {}, message: 'Erro no token.' })
  }

  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ success: false, data: {}, message: 'Token mal formatado.' })
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, data: {}, message: 'Token inválido.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return res.status(401).json({ success: false, data: {}, message: 'Usuário não encontrado.' })
    }

    if (user.role === 'banned') {
      return res.status(403).json({ success: false, data: {}, message: 'ACCOUNT_BANNED' })
    }

    req.userId = user.id
    req.userRole = user.role
    return next()
  })
}

export default authMiddleware