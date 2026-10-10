const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

function formatUser(u) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar_url, xp: u.xp, salves: u.salves, level: u.level, role: u.role || 'user', emailVerified: Boolean(u.email_verified), accountType: u.account_type || 'user', createdAt: u.created_at }
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
    // só os campos enviados (antes, mandar um só apagava os outros)
    const update = {}
    if (typeof req.body.name === 'string' && req.body.name.trim()) update.name = req.body.name.trim()
    if (req.body.avatarUrl !== undefined) update.avatar_url = req.body.avatarUrl || null
    // escolha "Qual é o seu perfil?" depois do cadastro (spec 6.3)
    if (['user', 'institution'].includes(req.body.accountType)) update.account_type = req.body.accountType
    if (Object.keys(update).length) await db('users').where({ id: req.userId }).update({ ...update, updated_at: new Date() })
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
