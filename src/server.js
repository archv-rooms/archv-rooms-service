import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import planRoutes from './routes/planRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/plans', planRoutes)
app.use('/library', libraryRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: "Archv.rooms OS API Online!"
  })
})

app.listen(PORT, () => {
  console.log(`Seja bem-vindo ao [Archv.rooms] Servidor rodando na porta ${PORT}!`)
})
