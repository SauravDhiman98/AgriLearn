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
const allowedOrigins = new Set(['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'])

async function startServer() {
  await initializeDatabase()

  aggregateDailyStats(formatDate())
  aggregateDailyStats(shiftDate(formatDate(), -1))
  await syncUserSnapshot(formatDate())

  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
      },
    })
  )
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
