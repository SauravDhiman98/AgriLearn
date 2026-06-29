const bcrypt = require('bcryptjs')
const db = require('./index')

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id INTEGER,
    path TEXT NOT NULL,
    platform TEXT DEFAULT 'web',
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    referrer TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    user_id INTEGER,
    ip_address TEXT,
    platform TEXT DEFAULT 'web',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    total_api_calls INTEGER DEFAULT 0,
    avg_response_time_ms REAL DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    platform_web INTEGER DEFAULT 0,
    platform_mobile INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    total_users INTEGER DEFAULT 0,
    new_today INTEGER DEFAULT 0,
    active_today INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_snapshots_snapshot_date ON user_snapshots (snapshot_date)`,
]

async function initializeDatabase() {
  schemaStatements.forEach((statement) => db.prepare(statement).run())

  const adminCount = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count
  if (adminCount === 0) {
    const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'
    const passwordHash = await bcrypt.hash(password, 10)
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash)
  }
}

module.exports = { initializeDatabase }
