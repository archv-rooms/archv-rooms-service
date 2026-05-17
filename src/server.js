import 'dotenv/config'
import express from 'express'

import corsMiddleware from './middlewares/cors.js'

import { setupSwagger } from './swagger.js'

import adminRoutes from './routes/adminRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import authRoutes from './routes/authRoutes.js'
import planRoutes from './routes/planRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'
import userRoutes from './routes/userRoutes.js'
import checkoutRoutes from './routes/checkoutRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(corsMiddleware)

app.use(express.json())

setupSwagger(app)

app.use('/admin', adminRoutes)
app.use('/api/games', gameRoutes)        
app.use('/auth', authRoutes)
app.use('/plans', planRoutes)
app.use('/library', libraryRoutes)
app.use('/user', userRoutes)
app.use('/checkout', checkoutRoutes)

app.get('/', (req, res) => { //colocar link api aq 
  res.status(200).json({
    success: true,
    data: {},
    message: "Archv.rooms OS API Online!"
  })
})

app.listen(PORT, () => {
  console.log(`Seja bem-vindo ao [Archv.rooms] Servidor rodando na porta ${PORT}!`)
})