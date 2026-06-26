import express from 'express'
import passport from '../config/passport.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}))

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google` }),
  (req, res) => {
    const user = req.user

    const token = jwt.sign(
      { id: user.id, role: user.role, sessionToken: user.sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
  const needsUsername = !user.username

  res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&name=${encodeURIComponent(user.name)}&role=${user.role}&needsUsername=${needsUsername}`)
  }
)

export default router