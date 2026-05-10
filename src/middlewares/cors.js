import cors from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200', 
  'https://COLOCAR-AQ-FRONTEND.VERSEL.APP'
]

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
})

export default corsMiddleware