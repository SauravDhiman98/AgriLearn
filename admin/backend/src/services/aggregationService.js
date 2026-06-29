const db = require('../db')
const { fetchSpringAnalytics } = require('./springAnalyticsService')

const visitorKeyExpression = `COALESCE(CASE WHEN user_id IS NOT NULL THEN 'user-' || user_id END, 'session-' || session_id)`

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

function aggregateDailyStats(targetDate = formatDate()) {
  const visitRow = db.prepare(
    `SELECT
      COUNT(*) AS total_visits,
      COUNT(DISTINCT ${visitorKeyExpression}) AS unique_visitors,
      SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) AS platform_web,
      SUM(CASE WHEN platform = 'mobile' THEN 1 ELSE 0 END) AS platform_mobile
    FROM visits
    WHERE DATE(created_at) = ?`
  ).get(targetDate)

  const apiRow = db.prepare(
    `SELECT
      COUNT(*) AS total_api_calls,
      COALESCE(AVG(response_time_ms), 0) AS avg_response_time_ms,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS error_count
    FROM api_logs
    WHERE DATE(created_at) = ?`
  ).get(targetDate)

  const newUsersRow = db.prepare(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT user_id
       FROM visits
       WHERE user_id IS NOT NULL
       GROUP BY user_id
       HAVING MIN(DATE(created_at)) = ?
     )`
  ).get(targetDate)

  const returningUsersRow = db.prepare(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT DISTINCT v.user_id
       FROM visits v
       WHERE v.user_id IS NOT NULL
         AND DATE(v.created_at) = ?
         AND EXISTS (
           SELECT 1
           FROM visits previous_visits
           WHERE previous_visits.user_id = v.user_id
             AND DATE(previous_visits.created_at) < ?
         )
     )`
  ).get(targetDate, targetDate)

  db.prepare(
    `INSERT INTO daily_stats (
      date, total_visits, unique_visitors, new_users, returning_users,
      total_api_calls, avg_response_time_ms, error_count, platform_web, platform_mobile
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_visits = excluded.total_visits,
      unique_visitors = excluded.unique_visitors,
      new_users = excluded.new_users,
      returning_users = excluded.returning_users,
      total_api_calls = excluded.total_api_calls,
      avg_response_time_ms = excluded.avg_response_time_ms,
      error_count = excluded.error_count,
      platform_web = excluded.platform_web,
      platform_mobile = excluded.platform_mobile`
  ).run(
    targetDate,
    Number(visitRow.total_visits || 0),
    Number(visitRow.unique_visitors || 0),
    Number(newUsersRow.count || 0),
    Number(returningUsersRow.count || 0),
    Number(apiRow.total_api_calls || 0),
    Number(apiRow.avg_response_time_ms || 0),
    Number(apiRow.error_count || 0),
    Number(visitRow.platform_web || 0),
    Number(visitRow.platform_mobile || 0)
  )
}

async function syncUserSnapshot(snapshotDate = formatDate()) {
  const snapshot = await fetchSpringAnalytics()
  if (!snapshot) {
    return null
  }

  db.prepare(
    `INSERT INTO user_snapshots (snapshot_date, total_users, new_today, active_today)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(snapshot_date) DO UPDATE SET
       total_users = excluded.total_users,
       new_today = excluded.new_today,
       active_today = excluded.active_today`
  ).run(snapshotDate, snapshot.totalUsers, snapshot.newToday, snapshot.activeToday)

  return snapshot
}

async function runDailyMaintenance() {
  const today = formatDate()
  const yesterday = shiftDate(today, -1)
  aggregateDailyStats(yesterday)
  await syncUserSnapshot(today)
}

module.exports = {
  aggregateDailyStats,
  formatDate,
  runDailyMaintenance,
  shiftDate,
  syncUserSnapshot,
  visitorKeyExpression,
}
