const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { rows: admins } = await pool.query(
      'SELECT id, username, created_at FROM admin_users ORDER BY created_at DESC, id DESC'
    )

    res.json({
      currentAdmin: req.admin,
      admins,
    })
  } catch (error) {
    next(error)
  }
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

    const { rows } = await pool.query('SELECT * FROM admin_users WHERE id = $1', [req.admin.id])
    const admin = rows[0]
    const isValid = admin && (await bcrypt.compare(currentPassword, admin.password_hash))
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [passwordHash, req.admin.id])

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

    const { rows: existingRows } = await pool.query('SELECT id FROM admin_users WHERE username = $1', [username])
    if (existingRows[0]) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, passwordHash]
    )

    res.status(201).json({
      admin: {
        id: result.rows[0].id,
        username,
      },
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router