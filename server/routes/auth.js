const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { signToken, authMiddleware } = require('../middleware/auth')

const router = express.Router()

const phoneCodeStore = new Map()

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios: name, email, password' })

    const existing = await db('users').where({ email }).first()
    if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' })

    const password_hash = await bcrypt.hash(password, 10)
    const id = uuidv4()
    await db('users').insert({ id, name, email, password_hash })

    const user = await db('users').where({ id }).first()
    const token = signToken(id)
    res.status(201).json({ accessToken: token, refreshToken: token, user: formatUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Campos obrigatórios' })

    const user = await db('users').where({ email }).first()
    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'E-mail ou senha incorretos' })

    const token = signToken(user.id)
    res.json({ accessToken: token, refreshToken: token, user: formatUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json({ ok: true })
})

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  res.json({ ok: true, message: 'Se o e-mail existir, um link foi enviado.' })
})

// POST /auth/send-phone-code
router.post('/send-phone-code', authMiddleware, async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' })
  // Ainda não há provedor de SMS. Em produção o código não pode ir para o log (ninguém recebe e
  // quem lê o log veria códigos de terceiros): responde 503 e o app oferece "Pular por enquanto".
  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({ error: 'A verificação por SMS ainda não está disponível. Toque em "Pular por enquanto".' })
  }
  const code = String(Math.floor(1000 + Math.random() * 9000))
  phoneCodeStore.set(phone, code)
  console.log(`[SMS MOCK - só em dev] Código para ${phone}: ${code}`)
  res.json({ ok: true })
})

// POST /auth/verify-phone
router.post('/verify-phone', authMiddleware, async (req, res) => {
  const { phone, code } = req.body
  const stored = phoneCodeStore.get(phone)
  if (!stored || stored !== String(code)) {
    return res.status(400).json({ error: 'Código inválido' })
  }
  phoneCodeStore.delete(phone)
  try {
    await db('users').where({ id: req.userId }).update({ phone, updated_at: new Date() })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

function formatUser(u) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar_url, xp: u.xp, salves: u.salves, level: u.level, role: u.role || 'user', createdAt: u.created_at }
}

module.exports = router
