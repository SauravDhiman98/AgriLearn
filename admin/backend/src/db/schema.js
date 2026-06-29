const bcrypt = require('bcryptjs')
const pool = require('./index')

async function initializeDatabase() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id BIGINT,
        path TEXT NOT NULL,
        platform VARCHAR(20) DEFAULT 'web',
        ip_address TEXT,
        user_agent TEXT,
        country TEXT,
        referrer TEXT,
        duration_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        endpoint TEXT NOT NULL,
        status_code INTEGER,
        response_time_ms INTEGER,
        user_id BIGINT,
        ip_address TEXT,
        platform VARCHAR(20) DEFAULT 'web',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        new_users INTEGER DEFAULT 0,
        returning_users INTEGER DEFAULT 0,
        total_api_calls INTEGER DEFAULT 0,
        avg_response_time_ms NUMERIC(10,2) DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        platform_web INTEGER DEFAULT 0,
        platform_mobile INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_snapshots (
        id SERIAL PRIMARY KEY,
        snapshot_date DATE UNIQUE NOT NULL,
        total_users INTEGER DEFAULT 0,
        new_today INTEGER DEFAULT 0,
        active_today INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query('COMMIT')

    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM admin_users')
    if (parseInt(rows[0].count, 10) === 0) {
      const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'
      const passwordHash = await bcrypt.hash(password, 10)
      await pool.query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', ['admin', passwordHash])
      console.log('Default admin user created: admin / admin123')
    }

    console.log('Database initialized successfully')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { initializeDatabase }