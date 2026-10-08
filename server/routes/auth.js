const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const crypto = require('crypto')
const { signToken, authMiddleware } = require('../middleware/auth')
const { mailEnabled, sendMail, layout } = require('../mailer')

const router = express.Router()

const phoneCodeStore = new Map()
const isProduction = process.env.NODE_ENV === 'production'

const RESET_TTL_MS = 60 * 60 * 1000 // link de nova senha: 1 hora
const VERIFY_TTL_MS = 3 * 24 * 60 * 60 * 1000 // link de confirmação: 3 dias
const RESEND_WAIT_MS = 60 * 1000 // um e-mail do mesmo tipo por minuto

// endereço do app nos links dos e-mails (precisa ser absoluto)
function appUrl(req) {
  const base = process.env.APP_URL
    || (isProduction ? (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`) : 'http://localhost:5173')
  return base.replace(/\/$/, '')
}

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex')

// Cria o link (só o hash vai para o banco) e invalida os anteriores do mesmo tipo.
// Devolve null se um e-mail desse tipo foi enviado há menos de 1 minuto.
async function createEmailToken(userId, type, ttlMs) {
  const recent = await db('email_tokens')
    .where({ user_id: userId, type }).whereNull('used_at')
    .where('expires_at', '>', new Date(Date.now() + ttlMs - RESEND_WAIT_MS))
    .first()
  if (recent) return null
  await db('email_tokens').where({ user_id: userId, type }).whereNull('used_at').delete()
  const token = crypto.randomBytes(32).toString('hex')
  await db('email_tokens').insert({
    id: uuidv4(), user_id: userId, type, token_hash: hashToken(token), expires_at: new Date(Date.now() + ttlMs),
  })
  return token
}

// token válido (não usado, não vencido) → linha de email_tokens; senão null
async function findValidToken(token, type) {
  if (!token || typeof token !== 'string') return null
  return db('email_tokens')
    .where({ token_hash: hashToken(token), type }).whereNull('used_at')
    .where('expires_at', '>', new Date())
    .first()
}

async function sendVerificationEmail(req, user) {
  const token = await createEmailToken(user.id, 'verify', VERIFY_TTL_MS)
  if (!token) return true // já enviado há pouco
  const { html, text } = layout({
    name: user.name,
    intro: 'Falta só confirmar o seu e-mail para concluir o cadastro no Salvee.',
    button: 'Confirmar e-mail',
    url: `${appUrl(req)}/#/verify-email?token=${token}`,
    outro: 'O link vale por 3 dias. Se você não criou uma conta no Salvee, ignore este e-mail.',
  })
  return sendMail({ to: user.email, subject: 'Confirme seu e-mail no Salvee', text, html })
}

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
    // a confirmação por e-mail não pode impedir o cadastro: falha vai só para o log
    await sendVerificationEmail(req, user).catch(err => console.error('[e-mail confirmação]', err.message))
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
// Resposta sempre igual (não revela se o e-mail tem conta).
router.post('/forgot-password', async (req, res) => {
  const generic = { ok: true, message: 'Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha.' }
  try {
    if (isProduction && !mailEnabled()) {
      return res.status(503).json({ error: 'A recuperação de senha por e-mail ainda não está disponível. Fale com o suporte.' })
    }
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ error: 'Informe o e-mail' })
    const user = await db('users').whereRaw('LOWER(email) = ?', [email]).first()
    if (!user) return res.json(generic)

    const token = await createEmailToken(user.id, 'reset', RESET_TTL_MS)
    if (!token) return res.json(generic) // já enviado há menos de 1 minuto
    const { html, text } = layout({
      name: user.name,
      intro: 'Recebemos um pedido para criar uma nova senha da sua conta no Salvee.',
      button: 'Criar nova senha',
      url: `${appUrl(req)}/#/reset-password?token=${token}`,
      outro: 'O link vale por 1 hora e só pode ser usado uma vez. Se não foi você, ignore este e-mail: sua senha continua a mesma.',
    })
    await sendMail({ to: user.email, subject: 'Crie uma nova senha no Salvee', text, html })
    res.json(generic)
  } catch (err) {
    console.error('[e-mail nova senha]', err.message)
    res.json(generic)
  }
})

// POST /auth/reset-password  { token, password }
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!password || String(password).length < 6) return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres' })
    const row = await findValidToken(token, 'reset')
    if (!row) return res.status(400).json({ error: 'Link inválido ou vencido. Peça um novo em "Esqueci minha senha".' })

    const password_hash = await bcrypt.hash(String(password), 10)
    await db.transaction(async trx => {
      // quem recebeu o link no e-mail provou ser dono dele: confirma o e-mail também
      await trx('users').where({ id: row.user_id }).update({ password_hash, email_verified: true, updated_at: new Date() })
      await trx('email_tokens').where({ id: row.id }).update({ used_at: new Date() })
      await trx('email_tokens').where({ user_id: row.user_id, type: 'reset' }).whereNull('used_at').delete()
    })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /auth/verify-email  { token } (o link pode ser aberto em outro aparelho, sem login)
router.post('/verify-email', async (req, res) => {
  try {
    const row = await findValidToken(req.body.token, 'verify')
    if (!row) return res.status(400).json({ error: 'Link inválido ou vencido. Peça um novo no app.' })
    await db('users').where({ id: row.user_id }).update({ email_verified: true, updated_at: new Date() })
    await db('email_tokens').where({ id: row.id }).update({ used_at: new Date() })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /auth/resend-verification
router.post('/resend-verification', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    if (user.email_verified) return res.json({ ok: true, alreadyVerified: true })
    if (isProduction && !mailEnabled()) {
      return res.status(503).json({ error: 'A confirmação por e-mail ainda não está disponível.' })
    }
    await sendVerificationEmail(req, user)
    res.json({ ok: true })
  } catch (err) {
    console.error('[e-mail confirmação]', err.message)
    res.status(500).json({ error: 'Não foi possível enviar o e-mail agora. Tente mais tarde.' })
  }
})

// GET /auth/mail-status → o app sabe se há envio de e-mail (sem SMTP em produção, pula a confirmação)
router.get('/mail-status', (_req, res) => {
  res.json({ enabled: mailEnabled() || !isProduction })
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
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar_url, xp: u.xp, salves: u.salves, level: u.level, role: u.role || 'user', emailVerified: Boolean(u.email_verified), createdAt: u.created_at }
}

module.exports = router
