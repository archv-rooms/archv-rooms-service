import cors from 'cors'

const allowedOrigins = [ // caso queira testa uma porta colocar o link abaixo 
  'http://localhost:3000', // dev/back link
  'https://COLOCAR-AQ-FRONTEND.VERSEL.APP' // front link
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