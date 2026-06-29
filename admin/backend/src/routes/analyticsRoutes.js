const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')
const { formatDate, shiftDate, visitorKeyExpression } = require('../services/aggregationService')

const router = express.Router()

router.use(authMiddleware)

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function toInt(value) {
  return Number.parseInt(value || 0, 10)
}

function toFloat(value) {
  return Number.parseFloat(value || 0)
}

async function getRangeSummary(startDate, endDate) {
  const { rows: visitRows } = await pool.query(
    `SELECT
       COUNT(*) AS visits,
       COUNT(DISTINCT ${visitorKeyExpression}) AS unique_visitors
     FROM visits
     WHERE created_at::date BETWEEN $1 AND $2`,
    [startDate, endDate]
  )

  const { rows: apiRows } = await pool.query(
    `SELECT
       COUNT(*) AS api_calls,
       SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS errors,
       COALESCE(AVG(response_time_ms), 0) AS avg_response_time_ms
     FROM api_logs
     WHERE created_at::date BETWEEN $1 AND $2`,
    [startDate, endDate]
  )

  const { rows: newUsersRows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT user_id
       FROM visits
       WHERE user_id IS NOT NULL
       GROUP BY user_id
       HAVING MIN(created_at::date) BETWEEN $1 AND $2
     ) sub`,
    [startDate, endDate]
  )

  const { rows: returningUsersRows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT DISTINCT v.user_id
       FROM visits v
       WHERE v.user_id IS NOT NULL
         AND v.created_at::date BETWEEN $1 AND $2
         AND EXISTS (
           SELECT 1
           FROM visits pv
           WHERE pv.user_id = v.user_id
             AND pv.created_at::date < $1
         )
     ) sub`,
    [startDate, endDate]
  )

  const visitRow = visitRows[0]
  const apiRow = apiRows[0]

  return {
    visits: toInt(visitRow.visits),
    uniqueVisitors: toInt(visitRow.unique_visitors),
    newUsers: toInt(newUsersRows[0].count),
    returningUsers: toInt(returningUsersRows[0].count),
    apiCalls: toInt(apiRow.api_calls),
    errors: toInt(apiRow.errors),
    avgResponseTimeMs: toFloat(apiRow.avg_response_time_ms),
  }
}

router.get('/overview', async (req, res, next) => {
  try {
    const today = formatDate()
    const yesterday = shiftDate(today, -1)
    const last7Start = shiftDate(today, -6)
    const last30Start = shiftDate(today, -29)

    const [userCountResult, visitsResult, apiCallsResult, todaySummary, yesterdaySummary, last7DaysSummary, last30DaysSummary] =
      await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM users'),
        pool.query('SELECT COUNT(*) AS count FROM visits'),
        pool.query('SELECT COUNT(*) AS count FROM api_logs'),
        getRangeSummary(today, today),
        getRangeSummary(yesterday, yesterday),
        getRangeSummary(last7Start, today),
        getRangeSummary(last30Start, today),
      ])

    res.json({
      today: todaySummary,
      yesterday: yesterdaySummary,
      last7Days: last7DaysSummary,
      last30Days: last30DaysSummary,
      allTime: {
        totalUsers: toInt(userCountResult.rows[0]?.count),
        totalVisits: toInt(visitsResult.rows[0].count),
        totalApiCalls: toInt(apiCallsResult.rows[0].count),
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/daily', async (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 30)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const { rows } = await pool.query(
      `SELECT
         date,
         total_visits AS "totalVisits",
         unique_visitors AS "uniqueVisitors",
         new_users AS "newUsers",
         returning_users AS "returningUsers",
         total_api_calls AS "totalApiCalls",
         avg_response_time_ms AS "avgResponseTimeMs",
         error_count AS "errorCount",
         platform_web AS "platformWeb",
         platform_mobile AS "platformMobile"
       FROM daily_stats
       WHERE date >= $1
       ORDER BY date ASC`,
      [startDate]
    )

    res.json(
      rows.map((row) => ({
        ...row,
        totalVisits: toInt(row.totalVisits),
        uniqueVisitors: toInt(row.uniqueVisitors),
        newUsers: toInt(row.newUsers),
        returningUsers: toInt(row.returningUsers),
        totalApiCalls: toInt(row.totalApiCalls),
        avgResponseTimeMs: toFloat(row.avgResponseTimeMs),
        errorCount: toInt(row.errorCount),
        platformWeb: toInt(row.platformWeb),
        platformMobile: toInt(row.platformMobile),
      }))
    )
  } catch (error) {
    next(error)
  }
})

router.get('/api-logs', async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1)
    const limit = parsePositiveInt(req.query.limit, 50)
    const offset = (page - 1) * limit
    const conditions = []
    const params = []

    if (req.query.method) {
      params.push(String(req.query.method).toUpperCase())
      conditions.push(`method = $${params.length}`)
    }

    if (req.query.endpoint) {
      params.push(`%${req.query.endpoint}%`)
      conditions.push(`endpoint ILIKE $${params.length}`)
    }

    if (req.query.date) {
      params.push(req.query.date)
      conditions.push(`created_at::date = $${params.length}`)
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
    const countResult = await pool.query(`SELECT COUNT(*) AS count FROM api_logs ${whereClause}`, params)
    const total = toInt(countResult.rows[0].count)

    const dataParams = [...params, limit, offset]
    const { rows } = await pool.query(
      `SELECT
         id,
         method,
         endpoint,
         status_code AS "statusCode",
         response_time_ms AS "responseTimeMs",
         user_id AS "userId",
         ip_address AS "ipAddress",
         platform,
         created_at AS "createdAt"
       FROM api_logs
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      dataParams
    )

    res.json({
      data: rows.map((row) => ({
        ...row,
        id: toInt(row.id),
        statusCode: row.statusCode == null ? null : toInt(row.statusCode),
        responseTimeMs: row.responseTimeMs == null ? null : toInt(row.responseTimeMs),
        userId: row.userId == null ? null : toInt(row.userId),
      })),
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

router.get('/visits', async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1)
    const limit = parsePositiveInt(req.query.limit, 50)
    const offset = (page - 1) * limit
    const conditions = []
    const params = []

    if (req.query.platform) {
      params.push(req.query.platform)
      conditions.push(`platform = $${params.length}`)
    }

    if (req.query.date) {
      params.push(req.query.date)
      conditions.push(`created_at::date = $${params.length}`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const countResult = await pool.query(`SELECT COUNT(*) AS count FROM visits ${whereClause}`, params)
    const total = toInt(countResult.rows[0].count)

    const dataParams = [...params, limit, offset]
    const { rows } = await pool.query(
      `SELECT
         id,
         session_id AS "sessionId",
         user_id AS "userId",
         path,
         platform,
         ip_address AS "ipAddress",
         user_agent AS "userAgent",
         referrer,
         duration_seconds AS "durationSeconds",
         created_at AS "createdAt"
       FROM visits
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      dataParams
    )

    res.json({
      data: rows.map((row) => ({
        ...row,
        id: toInt(row.id),
        userId: row.userId == null ? null : toInt(row.userId),
        durationSeconds: toInt(row.durationSeconds),
      })),
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

router.get('/top-endpoints', async (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 7)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const { rows } = await pool.query(
      `SELECT
         endpoint,
         COUNT(*) AS "totalCalls",
         ROUND(CAST(COALESCE(AVG(response_time_ms), 0) AS NUMERIC), 2) AS "avgResponseTimeMs",
         SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS "errorCount",
         ROUND(CAST(100.0 * SUM(CASE WHEN status_code BETWEEN 200 AND 399 THEN 1 ELSE 0 END) / COUNT(*) AS NUMERIC), 2) AS "successRate"
       FROM api_logs
       WHERE created_at::date >= $1
       GROUP BY endpoint
       ORDER BY "totalCalls" DESC, endpoint ASC
       LIMIT 10`,
      [startDate]
    )

    res.json(
      rows.map((row) => ({
        endpoint: row.endpoint,
        totalCalls: toInt(row.totalCalls),
        avgResponseTimeMs: toFloat(row.avgResponseTimeMs),
        errorCount: toInt(row.errorCount),
        successRate: toFloat(row.successRate),
      }))
    )
  } catch (error) {
    next(error)
  }
})

router.get('/top-pages', async (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 7)
    const startDate = shiftDate(formatDate(), -(days - 1))
    const { rows } = await pool.query(
      `SELECT
         path,
         COUNT(*) AS "visitCount",
         COUNT(DISTINCT ${visitorKeyExpression}) AS "uniqueVisitors",
         ROUND(CAST(COALESCE(AVG(duration_seconds), 0) AS NUMERIC), 2) AS "avgDuration"
       FROM visits
       WHERE created_at::date >= $1
       GROUP BY path
       ORDER BY "visitCount" DESC, path ASC
       LIMIT 10`,
      [startDate]
    )

    res.json(
      rows.map((row) => ({
        path: row.path,
        visitCount: toInt(row.visitCount),
        uniqueVisitors: toInt(row.uniqueVisitors),
        avgDuration: toFloat(row.avgDuration),
      }))
    )
  } catch (error) {
    next(error)
  }
})

router.get('/platforms', async (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 30)
    const startDate = shiftDate(formatDate(), -(days - 1))

    const [dailyResult, apiDailyResult, visitTotalsResult, apiTotalsResult] = await Promise.all([
      pool.query(
        `SELECT
           date,
           platform_web AS "visitWeb",
           platform_mobile AS "visitMobile"
         FROM daily_stats
         WHERE date >= $1
         ORDER BY date ASC`,
        [startDate]
      ),
      pool.query(
        `SELECT
           created_at::date AS date,
           SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS "apiWeb",
           SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS "apiMobile"
         FROM api_logs
         WHERE created_at::date >= $1
         GROUP BY created_at::date
         ORDER BY created_at::date ASC`,
        [startDate]
      ),
      pool.query(
        `SELECT
           SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS web,
           SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS mobile
         FROM visits
         WHERE created_at::date >= $1`,
        [startDate]
      ),
      pool.query(
        `SELECT
           SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS web,
           SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS mobile
         FROM api_logs
         WHERE created_at::date >= $1`,
        [startDate]
      ),
    ])

    const apiMap = new Map(
      apiDailyResult.rows.map((row) => [
        typeof row.date === 'string' ? row.date : formatDate(row.date),
        { apiWeb: toInt(row.apiWeb), apiMobile: toInt(row.apiMobile) },
      ])
    )

    const merged = dailyResult.rows.map((row) => {
      const dateKey = typeof row.date === 'string' ? row.date : formatDate(row.date)
      return {
        date: dateKey,
        visitWeb: toInt(row.visitWeb),
        visitMobile: toInt(row.visitMobile),
        apiWeb: apiMap.get(dateKey)?.apiWeb || 0,
        apiMobile: apiMap.get(dateKey)?.apiMobile || 0,
      }
    })

    res.json({
      daily: merged,
      totals: {
        visits: {
          web: toInt(visitTotalsResult.rows[0].web),
          mobile: toInt(visitTotalsResult.rows[0].mobile),
        },
        apiCalls: {
          web: toInt(apiTotalsResult.rows[0].web),
          mobile: toInt(apiTotalsResult.rows[0].mobile),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/hourly', async (req, res, next) => {
  try {
    const date = req.query.date && req.query.date !== 'today' ? String(req.query.date) : formatDate()

    const [visitsResult, apiCallsResult] = await Promise.all([
      pool.query(
        `SELECT
           EXTRACT(HOUR FROM created_at)::int AS hour,
           COUNT(*) AS visits
         FROM visits
         WHERE created_at::date = $1
         GROUP BY EXTRACT(HOUR FROM created_at)
         ORDER BY hour ASC`,
        [date]
      ),
      pool.query(
        `SELECT
           EXTRACT(HOUR FROM created_at)::int AS hour,
           COUNT(*) AS "apiCalls"
         FROM api_logs
         WHERE created_at::date = $1
         GROUP BY EXTRACT(HOUR FROM created_at)
         ORDER BY hour ASC`,
        [date]
      ),
    ])

    const visitMap = new Map(visitsResult.rows.map((row) => [toInt(row.hour), toInt(row.visits)]))
    const apiMap = new Map(apiCallsResult.rows.map((row) => [toInt(row.hour), toInt(row.apiCalls)]))
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: visitMap.get(hour) || 0,
      apiCalls: apiMap.get(hour) || 0,
    }))

    res.json(hourly)
  } catch (error) {
    next(error)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         snapshot_date AS "snapshotDate",
         total_users AS "totalUsers",
         new_today AS "newToday",
         active_today AS "activeToday",
         created_at AS "createdAt"
       FROM user_snapshots
       ORDER BY snapshot_date ASC, id ASC`
    )

    res.json(
      rows.map((row) => ({
        ...row,
        id: toInt(row.id),
        totalUsers: toInt(row.totalUsers),
        newToday: toInt(row.newToday),
        activeToday: toInt(row.activeToday),
      }))
    )
  } catch (error) {
    next(error)
  }
})

// Direct query on Spring Boot users table — real-time user stats
router.get('/users-detail', async (req, res, next) => {
  try {
    const days = parsePositiveInt(req.query.days, 30)
    const startDate = shiftDate(formatDate(), -(days - 1))

    const [summaryResult, dailyResult, rolesResult, recentResult] = await Promise.all([
      // Overall counts
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS new_today,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_last_7,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_last_30,
          COUNT(*) FILTER (WHERE enabled = true)::int AS verified,
          COUNT(*) FILTER (WHERE enabled = false)::int AS unverified
        FROM users
      `),
      // Daily new registrations for chart
      pool.query(`
        SELECT
          created_at::date AS date,
          COUNT(*)::int AS new_users
        FROM users
        WHERE created_at::date >= $1
        GROUP BY created_at::date
        ORDER BY created_at::date ASC
      `, [startDate]),
      // Breakdown by role
      pool.query(`
        SELECT role, COUNT(*)::int AS count
        FROM users
        GROUP BY role
        ORDER BY count DESC
      `),
      // Recent signups
      pool.query(`
        SELECT
          id, first_name AS "firstName", last_name AS "lastName",
          email, role, enabled,
          created_at AS "createdAt"
        FROM users
        ORDER BY created_at DESC
        LIMIT 20
      `),
    ])

    res.json({
      summary: summaryResult.rows[0],
      daily: dailyResult.rows.map(r => ({ ...r, date: typeof r.date === 'string' ? r.date : formatDate(r.date) })),
      roles: rolesResult.rows,
      recentSignups: recentResult.rows,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router