const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await db('institutions').where({ status: 'approved' }).orderBy('name')
    res.json(list.map(formatInst))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/destaques', authMiddleware, async (req, res) => {
  try {
    const list = await db('institutions')
      .leftJoin('donations', 'institutions.id', 'donations.institution_id')
      .where('institutions.status', 'approved')
      .groupBy('institutions.id')
      .select('institutions.*')
      .sum({ total_donated: 'donations.amount' })
      // COALESCE no lugar de NULLS FIRST, que o MySQL não aceita (quem nunca recebeu vem primeiro)
      .orderByRaw('COALESCE(SUM(donations.amount), 0) ASC')
      .limit(10)
    res.json(list.map(i => ({ ...formatInst(i), totalDonated: Number(i.total_donated) || 0 })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /institutions/mine — instituições pelas quais o usuário é responsável (qualquer status)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const list = await db('institutions').where({ responsible_user_id: req.userId }).orderBy('name')
    res.json(list.map(i => ({
      id: i.id, name: i.name, status: i.status, logoUrl: i.logo_url || null,
      rejectionReason: i.rejection_reason || null, createdAt: i.created_at, updatedAt: i.updated_at,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /institutions/mine/:id — dados completos para o responsável corrigir o cadastro
router.get('/mine/:id', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst || !(await canManage(req.userId, inst))) return res.status(404).json({ error: 'Instituição não encontrada' })
    const fields = ['name', 'responsible', 'contact_email', 'contact_phone', 'category', 'subcategory', 'description',
      'audience', 'cnpj', 'street', 'city', 'state', 'zip', 'mission', 'founded_year', 'history', 'logo_url', 'photo_url', 'documents_url']
    res.json({
      id: inst.id, status: inst.status, rejectionReason: inst.rejection_reason || null,
      data: Object.fromEntries(fields.map(f => [f, inst[f] ?? null])),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /institutions/:id/resubmit — depois de corrigir, volta para análise (spec 8.7 needs_revision)
router.post('/:id/resubmit', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst || inst.responsible_user_id !== req.userId) return res.status(404).json({ error: 'Instituição não encontrada' })
    if (inst.status !== 'needs_revision') return res.status(409).json({ error: 'Esta instituição não está aguardando correção' })
    await db('institutions').where({ id: inst.id }).update({ status: 'pending', rejection_reason: null, updated_at: new Date() })
    res.json({ ok: true, status: 'pending' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
    // não aprovada só é visível para o responsável e para admin/gestor (spec 4.3)
    if (inst.status !== 'approved' && !(await canManage(req.userId, inst))) {
      return res.status(404).json({ error: 'Instituição não encontrada' })
    }
    res.json(formatInst(inst))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/register/step', authMiddleware, async (req, res) => {
  try {
    const { step, data, institutionId } = req.body
    let id = institutionId

    if (!id) {
      id = uuidv4()
      await db('institutions').insert({ id, name: data.name || '', status: 'pending', responsible_user_id: req.userId, ...flattenStep(step, data) })
    } else {
      // só o responsável (ou admin/gestor) altera os dados da instituição
      const inst = await db('institutions').where({ id }).first()
      if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
      if (!(await canManage(req.userId, inst))) return res.status(403).json({ error: 'Você não pode alterar esta instituição' })
      // etapa pulada ou sem nada preenchido: não há o que salvar (o knex recusa update vazio)
      const fields = flattenStep(step, data)
      if (Object.keys(fields).length) await db('institutions').where({ id }).update({ ...fields, updated_at: new Date() })
    }

    res.json({ institutionId: id, step })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

async function canManage(userId, inst) {
  if (inst.responsible_user_id && inst.responsible_user_id === userId) return true
  const user = await db('users').where({ id: userId }).first()
  return Boolean(user && ['admin', 'gestor'].includes(user.role))
}

function flattenStep(step, data) {
  const maps = {
    1: { name: data.name, responsible: data.responsible, contact_email: data.contact_email, contact_phone: data.contact_phone, category: data.category, subcategory: data.subcategory },
    2: { description: data.description, city: data.city, state: data.state, audience: data.audience, cnpj: data.cnpj, street: data.street, zip: data.zip, mission: data.mission, founded_year: data.founded_year ? Number(data.founded_year) : null },
    3: { logo_url: data.logo_url, photo_url: data.photo_url, history: data.history, documents_url: data.documents_url },
  }
  const flat = maps[step] || {}
  return Object.fromEntries(Object.entries(flat).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

function formatInst(i) {
  return {
    id: i.id,
    name: i.name,
    category: i.category || '',
    verified: Boolean(i.verified),
    status: i.status,
    description: i.description || '',
    logoUrl: i.logo_url,
    photos: i.photo_url ? [i.photo_url] : [],
    cnpj: i.cnpj,
    phone: i.contact_phone,
    address: i.street ? { street: i.street, city: i.city || '', state: i.state || '' } : undefined,
    mission: i.mission,
    history: i.history,
    foundedYear: i.founded_year,
  }
}

module.exports = router
