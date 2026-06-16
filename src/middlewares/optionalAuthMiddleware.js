import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  // Sem token — continua como guest sem bloquear
  if (!authHeader) return next()

  const parts = authHeader.split(' ')
  if (parts.length !== 2) return next()

  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) return next()

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    // Token inválido/expirado — continua como guest sem bloquear
    if (err || !decoded) return next()

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, sessionToken: true }
      })

      if (!user) return next()
      if (user.role === 'banned') return next()
      if (!decoded.sessionToken || decoded.sessionToken !== user.sessionToken) return next()

      req.userId   = user.id
      req.userRole = user.role
    } catch (e) {
      console.error('[optionalAuthMiddleware]', e)
    }

    return next()
  })
}

export default optionalAuthMiddleware