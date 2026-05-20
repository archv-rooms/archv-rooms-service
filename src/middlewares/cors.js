import cors from 'cors'

const allowedOrigins = [ 
  'https://archv-rooms-web.vercel.app'
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
