const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

function formatUser(u) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar_url, xp: u.xp, salves: u.salves, level: u.level, role: u.role || 'user', emailVerified: Boolean(u.email_verified), createdAt: u.created_at }
}

async function getUser(req, res) {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
}

async function updateUser(req, res) {
  try {
    const { name, avatarUrl } = req.body
    await db('users').where({ id: req.userId }).update({ name, avatar_url: avatarUrl })
    const user = await db('users').where({ id: req.userId }).first()
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
}

router.get('/me', authMiddleware, getUser)
router.patch('/me', authMiddleware, updateUser)
router.get('/profile', authMiddleware, getUser)
router.put('/profile', authMiddleware, updateUser)

module.exports = router
