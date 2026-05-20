import cors from 'cors'

const corsMiddleware = cors({
  origin: true, // Permite todas as origens
  credentials: true
})

export default corsMiddleware


// import cors from 'cors'

// const allowedOrigins = [ 
//   'https://archv-rooms-web.vercel.app/login',
//   'https://archv-rooms-web.vercel.app/pricing',
//   'https://archv-rooms-web.vercel.app'
// ]

// const corsMiddleware = cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true
// })

// export default corsMiddleware
