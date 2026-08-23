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
app.set('trust proxy', 1)

// Echo back any origin instead of '*' so the header is always present, even for
// preflight requests coming from as-yet-unlisted admin/staging front-ends
const corsOptions = {
  origin: true,
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

// Keep-alive: self-ping every 10 minutes to prevent Railway free-tier cold-start
const SELF_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`
  : `http://localhost:${PORT}/health`

cron.schedule('*/10 * * * *', async () => {
  try {
    const http = SELF_URL.startsWith('https') ? require('https') : require('http')
    http.get(SELF_URL, (res) => {
      if (res.statusCode !== 200) console.warn('Keep-alive ping returned', res.statusCode)
    }).on('error', (err) => console.warn('Keep-alive ping failed:', err.message))
  } catch (err) {
    console.warn('Keep-alive cron error:', err.message)
  }
})