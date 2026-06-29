require('dotenv').config()
const { Pool } = require('pg')

const databaseUrl = process.env.DATABASE_URL || 'postgresql://agrilearn:agrilearn123@localhost:5432/agrilearn'
const normalizedDatabaseUrl = databaseUrl.toLowerCase()

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    normalizedDatabaseUrl.includes('railway') || normalizedDatabaseUrl.includes('ssl')
      ? { rejectUnauthorized: false }
      : false,
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err)
})

module.exports = pool