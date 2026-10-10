const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

async function requireAdmin(req, res, next) {
  const user = await db('users').where({ id: req.userId }).first()
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado: apenas administradores' })
  req.userRole = 'admin'
  next()
}

async function requireGestor(req, res, next) {
  const user = await db('users').where({ id: req.userId }).first()
  if (!user || !['admin', 'gestor'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado: apenas gestores ou administradores' })
  }
  req.userRole = user.role
  next()
}

// GET /admin/users?name=...&role=...
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    let query = db('users').select('id', 'name', 'email', 'role', 'xp', 'salves', 'level', 'created_at')
    if (req.query.name) {
      query = query.where('name', 'like', `%${req.query.name}%`)
    }
    if (req.query.role) {
      query = query.where('role', req.query.role)
    }
    const users = await query.orderBy('name')
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PATCH /admin/users/:id/role  { role: 'gestor' | 'user' }
router.patch('/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'gestor'].includes(role)) {
      return res.status(400).json({ error: 'Role inválido. Use: user | gestor' })
    }
    const target = await db('users').where({ id: req.params.id }).first()
    if (!target) return res.status(404).json({ error: 'Usuário não encontrado' })
    if (target.role === 'admin') return res.status(403).json({ error: 'Não é possível alterar role de admin' })
    await db('users').where({ id: req.params.id }).update({ role, updated_at: new Date().toISOString() })
    res.json({ ok: true, userId: req.params.id, role })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /admin/institutions?status=pending&name=...
router.get('/institutions', authMiddleware, requireGestor, async (req, res) => {
  try {
    let query = db('institutions')
      .leftJoin('users', 'institutions.responsible_user_id', 'users.id')
      .select(
        'institutions.*',
        'users.name as responsible_user_name',
        'users.email as responsible_user_email'
      )
    // rascunho não enviado não é da conta do admin
    query = query.whereNot('institutions.status', 'draft')
    if (req.query.status) query = query.where('institutions.status', req.query.status)
    if (req.query.name) query = query.where('institutions.name', 'like', `%${req.query.name}%`)
    const list = await query.orderBy('institutions.created_at', 'desc')
    res.json(list.map(formatAdminInst))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PATCH /admin/institutions/:id/status  { status, reason? }
router.patch('/institutions/:id/status', authMiddleware, requireGestor, async (req, res) => {
  try {
    const { status, reason } = req.body
    const valid = ['approved', 'rejected', 'needs_revision']
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${valid.join(' | ')}` })
    }
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
    if (inst.status === 'draft') return res.status(409).json({ error: 'Cadastro ainda não enviado para análise' })

    const text = typeof reason === 'string' ? reason.trim() : ''
    // pedir revisão sem dizer o que corrigir deixa a instituição sem saída (spec 10.2)
    if (status === 'needs_revision' && !text) {
      return res.status(400).json({ error: 'Informe o que a instituição precisa corrigir' })
    }

    const update = { status, updated_at: new Date(), verified: status === 'approved' }
    // aprovada: some o motivo antigo; rejeitada/revisão: guarda o novo (ou mantém o anterior)
    if (status === 'approved') update.rejection_reason = null
    else if (text) update.rejection_reason = text

    await db('institutions').where({ id: req.params.id }).update(update)
    res.json({ ok: true, institutionId: req.params.id, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /admin/donations?status=pending
router.get('/donations', authMiddleware, requireGestor, async (req, res) => {
  try {
    let query = db('donations')
      .leftJoin('users', 'donations.user_id', 'users.id')
      .leftJoin('institutions', 'donations.institution_id', 'institutions.id')
      .select(
        'donations.*',
        'users.name as user_name', 'users.email as user_email',
        'institutions.name as institution_name'
      )
    if (req.query.status) query = query.where('donations.status', req.query.status)
    const list = await query.orderBy('donations.created_at', 'desc')
    res.json(list.map(d => ({
      id: d.id,
      status: d.status || 'confirmed',
      amount: d.amount,
      paymentMethod: d.payment_method,
      message: d.message || null,
      anonymous: Boolean(d.anonymous),
      xpEarned: d.xp_earned,
      salvesEarned: d.salves_earned,
      userId: d.user_id,
      userName: d.user_name || null,
      userEmail: d.user_email || null,
      institutionId: d.institution_id,
      institutionName: d.institution_name || 'Instituição',
      createdAt: d.created_at,
      confirmedAt: d.confirmed_at || null,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PATCH /admin/donations/:id/status  { status: 'confirmed' | 'cancelled' }
// Só sai de pending; confirmar credita XP/Salves ao doador uma única vez.
router.patch('/donations/:id/status', authMiddleware, requireGestor, async (req, res) => {
  try {
    const { status } = req.body
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: confirmed | cancelled' })
    }
    const result = await db.transaction(async trx => {
      const donation = await trx('donations').where({ id: req.params.id }).first()
      if (!donation) return { code: 404, error: 'Doação não encontrada' }
      // o where com status pending impede crédito em dobro se duas confirmações chegarem juntas
      const changed = await trx('donations')
        .where({ id: req.params.id, status: 'pending' })
        .update({
          status,
          confirmed_at: status === 'confirmed' ? new Date() : null,
          confirmed_by: req.userId,
          updated_at: new Date(),
        })
      if (!changed) return { code: 409, error: 'Esta doação já foi processada' }
      if (status === 'confirmed') {
        await trx('users').where({ id: donation.user_id })
          .increment({ xp: donation.xp_earned || 0, salves: donation.salves_earned || 0 })
        // doação de campanha: soma no arrecadado (barra de progresso, spec 15.3)
        if (donation.post_id) await trx('posts').where({ id: donation.post_id }).increment('campaign_current', donation.amount)
      }
      return { code: 200 }
    })
    if (result.code !== 200) return res.status(result.code).json({ error: result.error })
    res.json({ ok: true, donationId: req.params.id, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// ---- Promoções da busca (banners do topo; admin e gestor) ----
const LINK_TYPES = ['none', 'campaign', 'institution']
const DATE = /^\d{4}-\d{2}-\d{2}$/

function formatPromotion(p) {
  return {
    id: p.id, title: p.title, subtitle: p.subtitle || '', imageUrl: p.image_url || null,
    linkType: p.link_type || 'none', linkId: p.link_id || null, startsAt: p.starts_at || null, endsAt: p.ends_at || null,
    active: Boolean(p.active), sortOrder: p.sort_order || 0, createdAt: p.created_at,
  }
}

// valida o corpo; parcial = PATCH (só os campos enviados)
async function promotionFields(body, partial) {
  const f = {}
  const has = k => body[k] !== undefined
  if (!partial || has('title')) {
    const title = String(body.title || '').trim()
    if (!title) return { error: 'Informe o título' }
    if (title.length > 80) return { error: 'Título muito longo (máximo 80 caracteres)' }
    f.title = title
  }
  if (has('subtitle')) f.subtitle = String(body.subtitle || '').trim().slice(0, 140) || null
  if (has('imageUrl')) {
    if (body.imageUrl && !/^\/uploads\/[\w.-]+$/.test(body.imageUrl)) return { error: 'Imagem inválida' }
    f.image_url = body.imageUrl || null
  }
  if (!partial || has('linkType') || has('linkId')) {
    const type = LINK_TYPES.includes(body.linkType) ? body.linkType : 'none'
    const id = type === 'none' ? null : String(body.linkId || '')
    if (type === 'campaign' && !(await db('posts').where({ id, type: 'campaign' }).first())) return { error: 'Campanha não encontrada' }
    if (type === 'institution' && !(await db('institutions').where({ id, status: 'approved' }).first())) return { error: 'Instituição não encontrada' }
    f.link_type = type
    f.link_id = id
  }
  for (const [key, col] of [['startsAt', 'starts_at'], ['endsAt', 'ends_at']]) {
    if (has(key)) {
      if (body[key] && !DATE.test(body[key])) return { error: 'Data inválida' }
      f[col] = body[key] || null
    }
  }
  const starts = f.starts_at ?? body.startsAt, ends = f.ends_at ?? body.endsAt
  if (starts && ends && starts > ends) return { error: 'A data de fim é antes da data de início' }
  if (has('active')) f.active = Boolean(body.active)
  if (has('sortOrder')) f.sort_order = Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
  return { fields: f }
}

router.get('/promotions', authMiddleware, requireGestor, async (req, res) => {
  try {
    const list = await db('promotions').orderBy('sort_order').orderBy('created_at', 'desc')
    res.json(list.map(formatPromotion))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/promotions', authMiddleware, requireGestor, async (req, res) => {
  try {
    const { fields, error } = await promotionFields(req.body, false)
    if (error) return res.status(400).json({ error })
    const id = require('uuid').v4()
    await db('promotions').insert({ id, active: true, sort_order: 0, ...fields, created_by: req.userId })
    res.status(201).json(formatPromotion(await db('promotions').where({ id }).first()))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.patch('/promotions/:id', authMiddleware, requireGestor, async (req, res) => {
  try {
    const promo = await db('promotions').where({ id: req.params.id }).first()
    if (!promo) return res.status(404).json({ error: 'Promoção não encontrada' })
    const { fields, error } = await promotionFields({ startsAt: promo.starts_at, endsAt: promo.ends_at, ...req.body }, true)
    if (error) return res.status(400).json({ error })
    if (Object.keys(fields).length) await db('promotions').where({ id: promo.id }).update({ ...fields, updated_at: new Date() })
    res.json(formatPromotion(await db('promotions').where({ id: promo.id }).first()))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.delete('/promotions/:id', authMiddleware, requireGestor, async (req, res) => {
  try {
    await db('promotions').where({ id: req.params.id }).delete()
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

function formatAdminInst(i) {
  return {
    id: i.id,
    name: i.name,
    status: i.status,
    category: i.category || '',
    verified: Boolean(i.verified),
    responsibleUserId: i.responsible_user_id,
    responsibleUserName: i.responsible_user_name || i.responsible || null,
    responsibleUserEmail: i.responsible_user_email || i.contact_email || null,
    rejectionReason: i.rejection_reason || null,
    documentsUrl: i.documents_url || null,
    city: i.city,
    state: i.state,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  }
}

module.exports = router
