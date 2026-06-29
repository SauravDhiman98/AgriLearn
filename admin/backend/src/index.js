require('dotenv').config()

const cron = require('node-cron')
const cors = require('cors')
const express = require('express')
const { initializeDatabase } = require('./db/schema')
const analyticsRoutes = require('./routes/analyticsRoutes')
const authRoutes = require('./routes/authRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const trackRoutes = require('./routes/trackRoutes')
const { errorMiddleware, notFoundHandler } = require('./middleware/errorMiddleware')
const { aggregateDailyStats, formatDate, runDailyMaintenance, shiftDate, syncUserSnapshot } = require('./services/aggregationService')

const PORT = Number(process.env.PORT || 3001)

async function startServer() {
  await initializeDatabase()

  await aggregateDailyStats(formatDate())
  await aggregateDailyStats(shiftDate(formatDate(), -1))
  await syncUserSnapshot(formatDate())

  const app = express()

  // Explicit CORS — must come before ALL routes so OPTIONS preflight is handled first
  const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }
  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions)) // explicit preflight handler for every route

  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/track', trackRoutes)
  app.use('/api/settings', settingsRoutes)

  app.use(notFoundHandler)
  app.use(errorMiddleware)

  cron.schedule('0 0 * * *', async () => {
    try {
      await runDailyMaintenance()
      console.log('Daily admin analytics maintenance completed')
    } catch (error) {
      console.error('Daily admin analytics maintenance failed:', error)
    }
  })

  app.listen(PORT, () => {
    console.log(`Tassy Point admin backend running on http://localhost:${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start admin backend:', error)
  process.exit(1)
})