const pool = require('../db')

// Query user stats directly from the shared PostgreSQL DB (Spring Boot users table)
async function fetchSpringAnalytics() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE created_at::date = $1)::int AS new_today,
        COUNT(*) FILTER (WHERE updated_at::date = $1)::int AS active_today
      FROM users
    `, [today])

    const row = rows[0]
    return {
      totalUsers: row.total_users || 0,
      newToday: row.new_today || 0,
      activeToday: row.active_today || 0,
    }
  } catch (error) {
    console.warn('Unable to fetch user analytics from DB:', error.message)
    return null
  }
}

module.exports = { fetchSpringAnalytics }
