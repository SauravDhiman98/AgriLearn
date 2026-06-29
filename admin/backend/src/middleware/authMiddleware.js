const jwt = require('jsonwebtoken')
const db = require('../db')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const admin = db.prepare('SELECT id, username, created_at FROM admin_users WHERE id = ?').get(payload.id)

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
