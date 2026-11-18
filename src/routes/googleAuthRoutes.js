import express from 'express'
import passport from '../config/passport.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Only these app link formats are accepted (prevents sending the token to strangers)
const ALLOWED_APP_PREFIXES = ['archvroomsmobile://', 'exp://']

function isAllowedAppUrl(url) {
  return typeof url === 'string' && ALLOWED_APP_PREFIXES.some((p) => url.startsWith(p))
}

function withParams(url, params) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${params}`
}

router.get('/google', (req, res, next) => {
  const options = { scope: ['profile', 'email'], session: false }

  // The mobile app sends ?app=<its link>; we carry it through Google in "state"
  if (isAllowedAppUrl(req.query.app)) {
    options.state = Buffer.from(req.query.app).toString('base64url')
  }

  passport.authenticate('google', options)(req, res, next)
})

router.get('/google/callback', (req, res, next) => {
  let appUrl = null
  if (req.query.state) {
    try {
      const decoded = Buffer.from(String(req.query.state), 'base64url').toString()
      if (isAllowedAppUrl(decoded)) appUrl = decoded
    } catch (e) {}
  }

  console.log('CALLBACK state:', req.query.state, '| appUrl:', appUrl)

  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      if (appUrl) return res.redirect(withParams(appUrl, 'error=google'))
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google`)
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, sessionToken: user.sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    const needsUsername = !user.username
    const params = `token=${token}&name=${encodeURIComponent(user.name)}&role=${user.role}&needsUsername=${needsUsername}`

    if (appUrl) return res.redirect(withParams(appUrl, params))

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?${params}`)
  })(req, res, next)
})

export default router