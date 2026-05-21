// ─── Core ────────────────────────────────────────────────
import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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

// ─── Setup ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// ─── Middlewares globais ──────────────────────────────────
app.use(corsMiddleware)
app.use(express.json())
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// ─── Swagger ──────────────────────────────────────────────
setupSwagger(app)

// ─── Rotas ────────────────────────────────────────────────
app.use('/admin', adminRoutes)
app.use('/auth', authRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/api/games', gameRoutes)
app.use('/library', libraryRoutes)
app.use('/plans', planRoutes)
app.use('/upload', uploadRoutes)
app.use('/user', userRoutes)

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