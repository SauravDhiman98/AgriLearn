const pool = require('../db')
const { fetchSpringAnalytics } = require('./springAnalyticsService')

const visitorKeyExpression = `COALESCE(CASE WHEN user_id IS NOT NULL THEN 'user-' || user_id::text ELSE NULL END, 'session-' || session_id)`

function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

async function aggregateDailyStats(targetDate = formatDate()) {
  const { rows: visitRows } = await pool.query(
    `SELECT
      COUNT(*) AS total_visits,
      COUNT(DISTINCT ${visitorKeyExpression}) AS unique_visitors,
      SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS platform_web,
      SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS platform_mobile
    FROM visits
    WHERE created_at::date = $1`,
    [targetDate]
  )
  const visitRow = visitRows[0]

  const { rows: apiRows } = await pool.query(
    `SELECT
      COUNT(*) AS total_api_calls,
      COALESCE(AVG(response_time_ms), 0) AS avg_response_time_ms,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS error_count
    FROM api_logs
    WHERE created_at::date = $1`,
    [targetDate]
  )
  const apiRow = apiRows[0]

  const { rows: newUsersRows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT user_id
       FROM visits
       WHERE user_id IS NOT NULL
       GROUP BY user_id
       HAVING MIN(created_at::date) = $1
     ) sub`,
    [targetDate]
  )

  const { rows: returningRows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT DISTINCT v.user_id
       FROM visits v
       WHERE v.user_id IS NOT NULL
         AND v.created_at::date = $1
         AND EXISTS (
           SELECT 1
           FROM visits pv
           WHERE pv.user_id = v.user_id
             AND pv.created_at::date < $1
         )
     ) sub`,
    [targetDate]
  )

  await pool.query(
    `INSERT INTO daily_stats (
      date, total_visits, unique_visitors, new_users, returning_users,
      total_api_calls, avg_response_time_ms, error_count, platform_web, platform_mobile
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT(date) DO UPDATE SET
      total_visits = EXCLUDED.total_visits,
      unique_visitors = EXCLUDED.unique_visitors,
      new_users = EXCLUDED.new_users,
      returning_users = EXCLUDED.returning_users,
      total_api_calls = EXCLUDED.total_api_calls,
      avg_response_time_ms = EXCLUDED.avg_response_time_ms,
      error_count = EXCLUDED.error_count,
      platform_web = EXCLUDED.platform_web,
      platform_mobile = EXCLUDED.platform_mobile`,
    [
      targetDate,
      parseInt(visitRow.total_visits || 0, 10),
      parseInt(visitRow.unique_visitors || 0, 10),
      parseInt(newUsersRows[0].count || 0, 10),
      parseInt(returningRows[0].count || 0, 10),
      parseInt(apiRow.total_api_calls || 0, 10),
      parseFloat(apiRow.avg_response_time_ms || 0),
      parseInt(apiRow.error_count || 0, 10),
      parseInt(visitRow.platform_web || 0, 10),
      parseInt(visitRow.platform_mobile || 0, 10),
    ]
  )
}

async function syncUserSnapshot(snapshotDate = formatDate()) {
  const snapshot = await fetchSpringAnalytics()
  if (!snapshot) return null

  await pool.query(
    `INSERT INTO user_snapshots (snapshot_date, total_users, new_today, active_today)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(snapshot_date) DO UPDATE SET
       total_users = EXCLUDED.total_users,
       new_today = EXCLUDED.new_today,
       active_today = EXCLUDED.active_today`,
    [snapshotDate, snapshot.totalUsers, snapshot.newToday, snapshot.activeToday]
  )
  return snapshot
}

async function runDailyMaintenance() {
  const today = formatDate()
  const yesterday = shiftDate(today, -1)
  await aggregateDailyStats(yesterday)
  await syncUserSnapshot(today)
}

module.exports = { aggregateDailyStats, formatDate, runDailyMaintenance, shiftDate, syncUserSnapshot, visitorKeyExpression }