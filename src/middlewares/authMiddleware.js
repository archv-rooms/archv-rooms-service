import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
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

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, data: {}, message: 'Token inválido.' })
    }

    if (decoded.role === 'banned') {
      return res.status(403).json({ success: false, data: {}, message: 'ACCOUNT_BANNED' })
    }

    req.userId   = decoded.id
    req.userRole = decoded.role
    return next()
  })
}

export default authMiddleware