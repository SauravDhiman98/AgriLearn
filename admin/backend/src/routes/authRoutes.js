const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' })

    const { rows } = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username])
    const admin = rows[0]
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })

    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' })
    return res.json({ token, admin: { id: admin.id, username: admin.username } })
  } catch (error) {
    next(error)
  }
})

router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin })
})

module.exports = router