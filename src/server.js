// ─── Core ────────────────────────────────────────────────
import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ─── Passport ────────────────────────────────────────────
import passport from './config/passport.js'

// ─── Middlewares ──────────────────────────────────────────
import corsMiddleware from './middlewares/cors.js'

// ─── Swagger ──────────────────────────────────────────────
import { setupSwagger } from './swagger.js'

// ─── Rotas ────────────────────────────────────────────────
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import checkoutRoutes from './routes/checkoutRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'
import planRoutes from './routes/planRoutes.js'
import uploadRoutes from './routes/upload.routes.js'
import userRoutes from './routes/userRoutes.js'
import platformsRoutes from './routes/platforms.routes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import donationRoutes from './routes/donationRoutes.js'
import saveRoutes from './routes/saves.js'
import googleAuthRoutes from './routes/googleAuthRoutes.js'
import gameSessionRoutes from './routes/gameSessionRoutes.js'
import themeRoutes from './routes/themeRoutes.js'

// ─── Setup ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.set('etag', false)
const PORT = process.env.PORT || 3000

// ─── Middlewares globais ──────────────────────────────────
app.use(corsMiddleware)
app.use(express.json())
app.use(passport.initialize())
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// ─── Swagger ──────────────────────────────────────────────
setupSwagger(app)

// ─── Rotas ────────────────────────────────────────────────
app.use('/api/admin',    adminRoutes)
app.use('/api/auth',     authRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/games',    gameRoutes)
app.use('/api/library',  libraryRoutes)
app.use('/api/plans',    planRoutes)
app.use('/api/upload',   uploadRoutes)
app.use('/api/user',     userRoutes)
app.use('/api/platforms', platformsRoutes)
app.use('/webhook',      webhookRoutes)
app.use('/api/donation', donationRoutes)
app.use('/api/saves',    saveRoutes)
app.use('/auth',         googleAuthRoutes)
app.use('/api/sessions', gameSessionRoutes)
app.use('/api/admin', themeRoutes)

// ─── Health check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Archv.rooms OS API Online!'
  })
})

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Seja bem-vindo ao Archv.rooms, aproveite a estadia! | Servidor rodando na porta ${PORT}`)
})