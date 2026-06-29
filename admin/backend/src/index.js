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

// Build and start Express immediately — DB errors must never prevent the server from binding
const app = express()

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/track', trackRoutes)
app.use('/api/settings', settingsRoutes)

app.use(notFoundHandler)
app.use(errorMiddleware)

// Listen first — Railway needs the port to bind before health checks
app.listen(PORT, () => {
  console.log(`Tassy Point admin backend running on port ${PORT}`)
})

// DB init and startup analytics run AFTER server is already listening
async function initializeAsync() {
  try {
    await initializeDatabase()
    console.log('Database ready')
  } catch (err) {
    console.error('Database initialization failed (routes may error):', err.message)
    return // skip analytics sync if tables don't exist
  }

  try {
    await aggregateDailyStats(formatDate())
    await aggregateDailyStats(shiftDate(formatDate(), -1))
    await syncUserSnapshot(formatDate())
  } catch (err) {
    console.warn('Startup analytics sync failed (non-fatal):', err.message)
  }
}

initializeAsync()

cron.schedule('0 0 * * *', async () => {
  try {
    await runDailyMaintenance()
    console.log('Daily admin analytics maintenance completed')
  } catch (error) {
    console.error('Daily admin analytics maintenance failed:', error)
  }
})