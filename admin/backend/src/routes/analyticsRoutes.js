const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/authMiddleware')
const { formatDate, shiftDate, visitorKeyExpression } = require('../services/aggregationService')

const router = express.Router()

router.use(authMiddleware)

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getRangeSummary(startDate, endDate) {
  const visitRow = db.prepare(
    `SELECT
      COUNT(*) AS visits,
      COUNT(DISTINCT ${visitorKeyExpression}) AS unique_visitors
    FROM visits
    WHERE DATE(created_at) BETWEEN ? AND ?`
  ).get(startDate, endDate)

  const apiRow = db.prepare(
    `SELECT
      COUNT(*) AS api_calls,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS errors,
      COALESCE(AVG(response_time_ms), 0) AS avg_response_time_ms
    FROM api_logs
    WHERE DATE(created_at) BETWEEN ? AND ?`
  ).get(startDate, endDate)

  const newUsersRow = db.prepare(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT user_id
       FROM visits
       WHERE user_id IS NOT NULL
       GROUP BY user_id
       HAVING MIN(DATE(created_at)) BETWEEN ? AND ?
     )`
  ).get(startDate, endDate)

  const returningUsersRow = db.prepare(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT DISTINCT v.user_id
       FROM visits v
       WHERE v.user_id IS NOT NULL
         AND DATE(v.created_at) BETWEEN ? AND ?
         AND EXISTS (
           SELECT 1
           FROM visits pv
           WHERE pv.user_id = v.user_id
             AND DATE(pv.created_at) < ?
         )
     )`
  ).get(startDate, endDate, startDate)

  return {
    visits: Number(visitRow.visits || 0),
    uniqueVisitors: Number(visitRow.unique_visitors || 0),
    newUsers: Number(newUsersRow.count || 0),
    returningUsers: Number(returningUsersRow.count || 0),
    apiCalls: Number(apiRow.api_calls || 0),
    errors: Number(apiRow.errors || 0),
    avgResponseTimeMs: Number(apiRow.avg_response_time_ms || 0),
  }
}

router.get('/overview', (req, res, next) => {
  try {
    const today = formatDate()
    const yesterday = shiftDate(today, -1)
    const last7Start = shiftDate(today, -6)
    const last30Start = shiftDate(today, -29)

    const latestSnapshot = db
      .prepare('SELECT total_users FROM user_snapshots ORDER BY snapshot_date DESC, id DESC LIMIT 1')
      .get()
    const allTimeVisits = db.prepare('SELECT COUNT(*) AS count FROM visits').get().count
    const allTimeApiCalls = db.prepare('SELECT COUNT(*) AS count FROM api_logs').get().count

    res.json({
      today: getRangeSummary(today, today),
      yesterday: getRangeSummary(yesterday, yesterday),
      last7Days: getRangeSummary(last7Start, today),
      last30Days: getRangeSummary(last30Start, today),
      allTime: {
        totalUsers: Number(latestSnapshot?.total_users || 0),
        totalVisits: Number(allTimeVisits || 0),
        totalApiCalls: Number(allTimeApiCalls || 0),
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/daily', (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 30)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const rows = db.prepare(
      `SELECT
        date,
        total_visits AS totalVisits,
        unique_visitors AS uniqueVisitors,
        new_users AS newUsers,
        returning_users AS returningUsers,
        total_api_calls AS totalApiCalls,
        avg_response_time_ms AS avgResponseTimeMs,
        error_count AS errorCount,
        platform_web AS platformWeb,
        platform_mobile AS platformMobile
      FROM daily_stats
      WHERE date >= ?
      ORDER BY date ASC`
    ).all(startDate)

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.get('/api-logs', (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1)
    const limit = parsePositiveInt(req.query.limit, 50)
    const offset = (page - 1) * limit
    const conditions = []
    const params = []

    if (req.query.method) {
      conditions.push('method = ?')
      params.push(String(req.query.method).toUpperCase())
    }

    if (req.query.endpoint) {
      conditions.push('endpoint LIKE ?')
      params.push(`%${req.query.endpoint}%`)
    }

    if (req.query.date) {
      conditions.push('DATE(created_at) = ?')
      params.push(req.query.date)
    }

    if (req.query.statusGroup) {
      const group = String(req.query.statusGroup)
      if (group === '2xx') {
        conditions.push('status_code BETWEEN 200 AND 299')
      } else if (group === '4xx') {
        conditions.push('status_code BETWEEN 400 AND 499')
      } else if (group === '5xx') {
        conditions.push('status_code >= 500')
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const total = db.prepare(`SELECT COUNT(*) AS count FROM api_logs ${whereClause}`).get(...params).count
    const rows = db.prepare(
      `SELECT
        id,
        method,
        endpoint,
        status_code AS statusCode,
        response_time_ms AS responseTimeMs,
        user_id AS userId,
        ip_address AS ipAddress,
        platform,
        created_at AS createdAt
      FROM api_logs
      ${whereClause}
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ? OFFSET ?`
    ).all(...params, limit, offset)

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/visits', (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1)
    const limit = parsePositiveInt(req.query.limit, 50)
    const offset = (page - 1) * limit
    const conditions = []
    const params = []

    if (req.query.platform) {
      conditions.push('platform = ?')
      params.push(req.query.platform)
    }

    if (req.query.date) {
      conditions.push('DATE(created_at) = ?')
      params.push(req.query.date)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const total = db.prepare(`SELECT COUNT(*) AS count FROM visits ${whereClause}`).get(...params).count
    const rows = db.prepare(
      `SELECT
        id,
        session_id AS sessionId,
        user_id AS userId,
        path,
        platform,
        ip_address AS ipAddress,
        user_agent AS userAgent,
        referrer,
        duration_seconds AS durationSeconds,
        created_at AS createdAt
      FROM visits
      ${whereClause}
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ? OFFSET ?`
    ).all(...params, limit, offset)

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/top-endpoints', (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 7)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const rows = db.prepare(
      `SELECT
        endpoint,
        COUNT(*) AS totalCalls,
        ROUND(COALESCE(AVG(response_time_ms), 0), 2) AS avgResponseTimeMs,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS errorCount,
        ROUND(100.0 * SUM(CASE WHEN status_code BETWEEN 200 AND 399 THEN 1 ELSE 0 END) / COUNT(*), 2) AS successRate
      FROM api_logs
      WHERE DATE(created_at) >= ?
      GROUP BY endpoint
      ORDER BY totalCalls DESC, endpoint ASC
      LIMIT 10`
    ).all(startDate)

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.get('/top-pages', (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 7)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const rows = db.prepare(
      `SELECT
        path,
        COUNT(*) AS visitCount,
        COUNT(DISTINCT ${visitorKeyExpression}) AS uniqueVisitors,
        ROUND(COALESCE(AVG(duration_seconds), 0), 2) AS avgDuration
      FROM visits
      WHERE DATE(created_at) >= ?
      GROUP BY path
      ORDER BY visitCount DESC, path ASC
      LIMIT 10`
    ).all(startDate)

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.get('/platforms', (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 30)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const daily = db.prepare(
      `SELECT
        date,
        platform_web AS visitWeb,
        platform_mobile AS visitMobile
      FROM daily_stats
      WHERE date >= ?
      ORDER BY date ASC`
    ).all(startDate)

    const apiDaily = db.prepare(
      `SELECT
        DATE(created_at) AS date,
        SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS apiWeb,
        SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS apiMobile
      FROM api_logs
      WHERE DATE(created_at) >= ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC`
    ).all(startDate)

    const apiMap = new Map(apiDaily.map((row) => [row.date, row]))
    const merged = daily.map((row) => ({
      ...row,
      apiWeb: Number(apiMap.get(row.date)?.apiWeb || 0),
      apiMobile: Number(apiMap.get(row.date)?.apiMobile || 0),
    }))

    const visitTotals = db.prepare(
      `SELECT
        SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS web,
        SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS mobile
      FROM visits
      WHERE DATE(created_at) >= ?`
    ).get(startDate)

    const apiTotals = db.prepare(
      `SELECT
        SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS web,
        SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS mobile
      FROM api_logs
      WHERE DATE(created_at) >= ?`
    ).get(startDate)

    res.json({
      daily: merged,
      totals: {
        visits: {
          web: Number(visitTotals.web || 0),
          mobile: Number(visitTotals.mobile || 0),
        },
        apiCalls: {
          web: Number(apiTotals.web || 0),
          mobile: Number(apiTotals.mobile || 0),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/hourly', (req, res, next) => {
  try {
    const date = req.query.date && req.query.date !== 'today' ? String(req.query.date) : formatDate()
    const visits = db.prepare(
      `SELECT
        CAST(strftime('%H', created_at) AS INTEGER) AS hour,
        COUNT(*) AS visits
      FROM visits
      WHERE DATE(created_at) = ?
      GROUP BY strftime('%H', created_at)`
    ).all(date)

    const apiCalls = db.prepare(
      `SELECT
        CAST(strftime('%H', created_at) AS INTEGER) AS hour,
        COUNT(*) AS apiCalls
      FROM api_logs
      WHERE DATE(created_at) = ?
      GROUP BY strftime('%H', created_at)`
    ).all(date)

    const visitMap = new Map(visits.map((row) => [row.hour, row.visits]))
    const apiMap = new Map(apiCalls.map((row) => [row.hour, row.apiCalls]))
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: Number(visitMap.get(hour) || 0),
      apiCalls: Number(apiMap.get(hour) || 0),
    }))

    res.json(hourly)
  } catch (error) {
    next(error)
  }
})

router.get('/users', (req, res, next) => {
  try {
    const rows = db.prepare(
      `SELECT
        id,
        snapshot_date AS snapshotDate,
        total_users AS totalUsers,
        new_today AS newToday,
        active_today AS activeToday,
        created_at AS createdAt
      FROM user_snapshots
      ORDER BY snapshot_date ASC, id ASC`
    ).all()

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
