const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', (req, res) => {
  const admins = db
    .prepare('SELECT id, username, created_at FROM admin_users ORDER BY created_at DESC, id DESC')
    .all()

  res.json({
    currentAdmin: req.admin,
    admins,
  })
})

router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' })
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id)
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash)
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, req.admin.id)

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
})

router.post('/admin', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username)
    if (existingAdmin) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)

    res.status(201).json({
      admin: {
        id: result.lastInsertRowid,
        username,
      },
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
