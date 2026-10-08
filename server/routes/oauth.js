// Login social (Google, Facebook, Apple) pelo fluxo "authorization code":
//   GET  /api/auth/oauth/providers            → quais estão configurados (o frontend esconde/avisa os demais)
//   GET  /api/auth/oauth/:provider            → redireciona para a tela de login do provedor
//   GET|POST /api/auth/oauth/:provider/callback → troca o code pelo perfil, cria/vincula o usuário e
//                                                 volta ao app em /#/oauth?token=... (ou /#/login?erro=...)
// Cada provedor só é ativado quando as variáveis de ambiente dele existem.
const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { signToken } = require('../middleware/auth')

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'salvee-dev-secret-change-in-prod'
const isProduction = process.env.NODE_ENV === 'production'
const STATE_COOKIE = 'salvee_oauth_state'
const LABELS = { google: 'Google', facebook: 'Facebook', apple: 'Apple' }

const PROVIDERS = {
  google: {
    enabled: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    authorizeUrl: (redirectUri, state) => 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    }),
    async profile(code, redirectUri) {
      const tokens = await postForm('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      })
      // id_token recebido direto do Google por HTTPS: pode ser lido sem validar a assinatura
      const claims = jwt.decode(tokens.id_token) || {}
      return {
        id: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true || claims.email_verified === 'true',
        name: claims.name,
        avatarUrl: claims.picture,
      }
    },
  },

  facebook: {
    enabled: () => Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    authorizeUrl: (redirectUri, state) => 'https://www.facebook.com/v19.0/dialog/oauth?' + new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    }),
    async profile(code, redirectUri) {
      const tokens = await getJson('https://graph.facebook.com/v19.0/oauth/access_token?' + new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      }))
      const me = await getJson('https://graph.facebook.com/v19.0/me?' + new URLSearchParams({
        fields: 'id,name,email,picture.type(large)',
        access_token: tokens.access_token,
      }))
      return {
        id: me.id,
        email: me.email,
        emailVerified: Boolean(me.email), // o Facebook só devolve e-mail confirmado
        name: me.name,
        avatarUrl: me.picture?.data?.url,
      }
    },
  },

  apple: {
    enabled: () => Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY),
    authorizeUrl: (redirectUri, state) => 'https://appleid.apple.com/auth/authorize?' + new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'form_post', // a Apple devolve por POST quando pede nome/e-mail
      scope: 'name email',
      state,
    }),
    async profile(code, redirectUri, body) {
      const tokens = await postForm('https://appleid.apple.com/auth/token', {
        code,
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: appleClientSecret(),
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      })
      const claims = jwt.decode(tokens.id_token) || {}
      // o nome só vem no primeiro login, no campo "user" do POST
      let name
      try {
        const user = typeof body.user === 'string' ? JSON.parse(body.user) : body.user
        name = [user?.name?.firstName, user?.name?.lastName].filter(Boolean).join(' ')
      } catch { /* sem nome */ }
      return {
        id: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true || claims.email_verified === 'true',
        name,
        avatarUrl: null,
      }
    },
  },
}

// client_secret da Apple: JWT ES256 assinado com a chave .p8 (vale até 6 meses; geramos a cada login)
function appleClientSecret() {
  const key = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  return jwt.sign({}, key, {
    algorithm: 'ES256',
    keyid: process.env.APPLE_KEY_ID,
    issuer: process.env.APPLE_TEAM_ID,
    audience: 'https://appleid.apple.com',
    subject: process.env.APPLE_CLIENT_ID,
    expiresIn: '5m',
  })
}

async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(params),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`token ${res.status}: ${data.error_description || data.error?.message || data.error || 'falha'}`)
  return data
}

async function getJson(url) {
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${res.status}: ${data.error?.message || 'falha'}`)
  return data
}

// endereço público da API (callback registrado no provedor) e do frontend (para onde voltamos)
function apiBase(req) {
  return (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')
}
function appBase() {
  return (process.env.APP_URL ?? (isProduction ? '' : 'http://localhost:5173')).replace(/\/$/, '')
}
function callbackUrl(req, provider) {
  return `${apiBase(req)}/api/auth/oauth/${provider}/callback`
}

function readCookie(req, name) {
  const match = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

// O retorno da Apple é um POST vindo de outro site: o cookie precisa de SameSite=None (exige Secure).
// Em dev (http://localhost) os navegadores aceitam Secure no localhost.
function stateCookie(value, maxAgeSeconds) {
  return `${STATE_COOKIE}=${encodeURIComponent(value)}; Path=/api/auth/oauth; HttpOnly; Secure; SameSite=None; Max-Age=${maxAgeSeconds}`
}

function backToApp(res, path) {
  res.redirect(`${appBase()}/#${path}`)
}

router.get('/providers', (_req, res) => {
  res.json(Object.fromEntries(Object.entries(PROVIDERS).map(([name, p]) => [name, p.enabled()])))
})

router.get('/:provider', (req, res) => {
  const provider = PROVIDERS[req.params.provider]
  if (!provider) return res.status(404).json({ error: 'Provedor desconhecido' })
  if (!provider.enabled()) return backToApp(res, '/login?erro=' + encodeURIComponent(`Entrar com ${LABELS[req.params.provider]} estará disponível em breve`))

  // nonce no cookie + state assinado: impede que alguém complete o login no navegador de outra pessoa
  const nonce = crypto.randomBytes(16).toString('hex')
  const state = jwt.sign({ p: req.params.provider, n: nonce }, JWT_SECRET, { expiresIn: '10m' })
  res.setHeader('Set-Cookie', stateCookie(nonce, 600))
  res.redirect(provider.authorizeUrl(callbackUrl(req, req.params.provider), state))
})

async function handleCallback(req, res) {
  const name = req.params.provider
  const provider = PROVIDERS[name]
  if (!provider || !provider.enabled()) return res.status(404).json({ error: 'Provedor desconhecido' })

  const params = { ...req.query, ...(req.body || {}) }
  res.setHeader('Set-Cookie', stateCookie('', 0))
  if (params.error) {
    const cancelled = ['access_denied', 'user_cancelled_authorize'].includes(params.error)
    return backToApp(res, '/login?erro=' + encodeURIComponent(cancelled ? 'Login cancelado' : 'Não foi possível entrar'))
  }

  try {
    const state = jwt.verify(String(params.state || ''), JWT_SECRET)
    if (state.p !== name || !state.n || state.n !== readCookie(req, STATE_COOKIE)) throw new Error('state inválido')

    const profile = await provider.profile(String(params.code || ''), callbackUrl(req, name), params)
    if (!profile.id) throw new Error('perfil sem id')

    const user = await findOrCreateUser(name, profile)
    const token = signToken(user.id)
    backToApp(res, '/oauth?token=' + encodeURIComponent(token))
  } catch (err) {
    console.error(`[oauth ${name}]`, err.message)
    const msg = err.userMessage || 'Não foi possível entrar. Tente novamente.'
    backToApp(res, '/login?erro=' + encodeURIComponent(msg))
  }
}

router.get('/:provider/callback', handleCallback)
router.post('/:provider/callback', express.urlencoded({ extended: false }), handleCallback)

// 1) já vinculado pelo id do provedor → entra; 2) mesmo e-mail confirmado → vincula à conta
// existente; 3) senão cria a conta (senha aleatória: entra só pelo provedor até trocar a senha).
async function findOrCreateUser(provider, profile) {
  const idColumn = `${provider}_id`
  const linked = await db('users').where({ [idColumn]: profile.id }).first()
  if (linked) return linked

  if (!profile.email) {
    const err = new Error('provedor não devolveu e-mail')
    err.userMessage = 'Sua conta não compartilhou o e-mail. Libere o e-mail ou cadastre-se com e-mail e senha.'
    throw err
  }
  const email = profile.email.toLowerCase()

  const existing = await db('users').whereRaw('LOWER(email) = ?', [email]).first()
  if (existing) {
    if (!profile.emailVerified) {
      const err = new Error('e-mail não confirmado no provedor')
      err.userMessage = 'Este e-mail já tem conta no Salvee. Entre com e-mail e senha.'
      throw err
    }
    const update = { [idColumn]: profile.id, email_verified: true, updated_at: new Date() }
    if (!existing.avatar_url && profile.avatarUrl) update.avatar_url = profile.avatarUrl
    await db('users').where({ id: existing.id }).update(update)
    return existing
  }

  const id = uuidv4()
  await db('users').insert({
    id,
    name: profile.name || email.split('@')[0],
    email,
    password_hash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
    avatar_url: profile.avatarUrl || null,
    email_verified: Boolean(profile.emailVerified),
    [idColumn]: profile.id,
  })
  return db('users').where({ id }).first()
}

module.exports = router
