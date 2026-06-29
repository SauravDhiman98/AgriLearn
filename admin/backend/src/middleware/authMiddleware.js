const jwt = require('jsonwebtoken')
const pool = require('../db')

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { rows } = await pool.query('SELECT id, username, created_at FROM admin_users WHERE id = $1', [payload.id])
    const admin = rows[0]

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' })
    }

    req.admin = admin
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware