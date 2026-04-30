const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url, xp: user.xp, salves: user.salves, level: user.level, createdAt: user.created_at })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body
    await db('users').where({ id: req.userId }).update({ name, avatar_url: avatarUrl })
    const user = await db('users').where({ id: req.userId }).first()
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url, xp: user.xp, salves: user.salves, level: user.level, createdAt: user.created_at })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
