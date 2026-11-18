import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function findOrCreateUser({ email, name, avatar }) {
  const sessionToken = crypto.randomBytes(32).toString('hex')

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password:       '',
        avatar,
        emailVerified:  true,
        onboardingDone: false,
        role:           'user',
        sessionToken
      }
    })
  } else {
    user = await prisma.user.update({
      where: { email },
      data:  { sessionToken }
    })
  }

  return user
}

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'https://archv-rooms-service.onrender.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email  = profile.emails?.[0]?.value
    const name   = profile.displayName
    const avatar = profile.photos?.[0]?.value

    if (!email) return done(null, false)

    const user = await findOrCreateUser({ email, name, avatar })
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  'https://archv-rooms-service.onrender.com/auth/github/callback',
  scope:        ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email  = profile.emails?.[0]?.value
    const name   = profile.displayName || profile.username
    const avatar = profile.photos?.[0]?.value

    if (!email) return done(null, false)

    const user = await findOrCreateUser({ email, name, avatar })
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

export default passport