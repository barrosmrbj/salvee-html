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
