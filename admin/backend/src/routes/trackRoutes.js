const express = require('express')
const db = require('../db')

const router = express.Router()
const buckets = new Map()

function trackRateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
  const key = `${ip}:${req.path}`
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 1000
  const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + windowMs
  }

  entry.count += 1
  buckets.set(key, entry)

  if (entry.count > maxRequests) {
    return res.status(429).json({ message: 'Too many tracking requests' })
  }

  next()
}

router.use(trackRateLimit)

router.post('/visit', (req, res, next) => {
  try {
    const { sessionId, userId, path, platform = 'web', referrer = null, userAgent = null } = req.body
    if (!sessionId || !path) {
      return res.status(400).json({ message: 'sessionId and path are required' })
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null
    db.prepare(
      `INSERT INTO visits (session_id, user_id, path, platform, ip_address, user_agent, country, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(sessionId, userId ?? null, path, platform, ipAddress, userAgent, null, referrer)

    return res.status(201).json({ success: true })
  } catch (error) {
    next(error)
  }
})

router.post('/api-call', (req, res, next) => {
  try {
    const { method, endpoint, statusCode = null, responseTimeMs = null, userId, platform = 'web' } = req.body
    if (!method || !endpoint) {
      return res.status(400).json({ message: 'method and endpoint are required' })
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null
    db.prepare(
      `INSERT INTO api_logs (method, endpoint, status_code, response_time_ms, user_id, ip_address, platform)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(method.toUpperCase(), endpoint, statusCode, responseTimeMs, userId ?? null, ipAddress, platform)

    return res.status(201).json({ success: true })
  } catch (error) {
    next(error)
  }
})

router.post('/visit-end', (req, res, next) => {
  try {
    const { sessionId, durationSeconds = 0 } = req.body
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' })
    }

    const result = db.prepare(
      `UPDATE visits
       SET duration_seconds = ?
       WHERE id = (
         SELECT id FROM visits
         WHERE session_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       )`
    ).run(durationSeconds, sessionId)

    return res.json({ success: result.changes > 0 })
  } catch (error) {
    next(error)
  }
})

module.exports = router
