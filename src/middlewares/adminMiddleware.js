import authMiddleware from './authMiddleware.js'

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, data: {}, message: 'Acesso negado. Apenas administradores.' })
    }
    next()
  })
}

export default adminMiddleware