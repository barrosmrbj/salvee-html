const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')
const { attentionRanking } = require('../attention')

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
    // spec 17.5: instituições com menos ajuda recente (doações confirmadas em 30 dias + seguidores)
    const { ranked, stats } = await attentionRanking()
    const ids = ranked.slice(0, 10)
    const rows = ids.length ? await db('institutions').whereIn('id', ids) : []
    const byId = new Map(rows.map(i => [i.id, i]))
    res.json(ids.filter(id => byId.has(id)).map(id => ({ ...formatInst(byId.get(id)), recentDonated: stats.get(id).recentDonated })))
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
    const fields = ['name', 'responsible', 'contact_email', 'contact_phone', 'category', 'subcategory', 'description', 'opening_hours', 'photos', 'latitude', 'longitude',
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

// POST /institutions/:id/submit — "Enviar para análise" no fim do cadastro: rascunho (draft) ou
// cadastro corrigido (needs_revision) vai para a fila de aprovação de admin/gestor (pending)
const REQUIRED = { name: 'nome da instituição', responsible: 'nome do responsável', category: 'categoria', description: 'descrição' }

async function submitForReview(req, res) {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst || inst.responsible_user_id !== req.userId) return res.status(404).json({ error: 'Instituição não encontrada' })
    if (!['draft', 'needs_revision'].includes(inst.status)) {
      return res.status(409).json({ error: 'Este cadastro já foi enviado para análise' })
    }
    const missing = Object.entries(REQUIRED).filter(([f]) => !String(inst[f] || '').trim()).map(([, label]) => label)
    if (!inst.contact_email && !inst.contact_phone) missing.push('e-mail ou telefone de contato')
    if (missing.length) return res.status(400).json({ error: `Falta preencher: ${missing.join(', ')}` })

    await db('institutions').where({ id: inst.id }).update({ status: 'pending', rejection_reason: null, updated_at: new Date() })
    res.json({ ok: true, status: 'pending' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
}
router.post('/:id/submit', authMiddleware, submitForReview)
router.post('/:id/resubmit', authMiddleware, submitForReview) // nome antigo (v1.12)

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
    // não aprovada só é visível para o responsável e para admin/gestor (spec 4.3)
    if (inst.status !== 'approved' && !(await canManage(req.userId, inst))) {
      return res.status(404).json({ error: 'Instituição não encontrada' })
    }
    const [follow, count] = await Promise.all([
      db('institution_follows').where({ institution_id: inst.id, user_id: req.userId }).first(),
      db('institution_follows').where({ institution_id: inst.id }).count({ n: '*' }).first(),
    ])
    res.json({ ...formatInst(inst), following: Boolean(follow), followersCount: Number(count?.n || 0), activeCampaign: await activeCampaign(inst.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

async function followersCount(institutionId) {
  const row = await db('institution_follows').where({ institution_id: institutionId }).count({ n: '*' }).first()
  return Number(row?.n || 0)
}

// POST /institutions/:id/follow — seguir (só aprovadas; repetir não duplica)
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id, status: 'approved' }).first()
    if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
    const exists = await db('institution_follows').where({ institution_id: inst.id, user_id: req.userId }).first()
    if (!exists) {
      await db('institution_follows').insert({ id: uuidv4(), institution_id: inst.id, user_id: req.userId })
        .catch(err => { if (!/unique|duplicate/i.test(err.message)) throw err })
    }
    res.json({ following: true, followersCount: await followersCount(inst.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /institutions/:id/follow — deixar de seguir
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await db('institution_follows').where({ institution_id: req.params.id, user_id: req.userId }).delete()
    res.json({ following: false, followersCount: await followersCount(req.params.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/register/step', authMiddleware, async (req, res) => {
  try {
    const { step, data, institutionId } = req.body
    let id = institutionId

    if (!id) {
      id = uuidv4()
      // rascunho: só entra na fila de aprovação ao "Enviar para análise" no fim (POST /:id/submit)
      await db('institutions').insert({ id, name: data.name || '', status: 'draft', responsible_user_id: req.userId, ...flattenStep(step, data) })
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
    2: { description: data.description, city: data.city, state: data.state, audience: data.audience, cnpj: data.cnpj, street: data.street, zip: data.zip, mission: data.mission, founded_year: data.founded_year ? Number(data.founded_year) : null, opening_hours: data.opening_hours, ...coordFields(data.latitude, data.longitude) },
    3: { logo_url: data.logo_url, history: data.history, documents_url: data.documents_url, ...photoFields(data.photos) },
  }
  const flat = maps[step] || {}
  return Object.fromEntries(Object.entries(flat).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

// coordenadas válidas (graus) ou nada; aceita número ou texto
function coordFields(lat, lng) {
  const la = Number(lat), lo = Number(lng)
  if (lat === '' || lat == null || lng === '' || lng == null) return {}
  if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return {}
  return { latitude: la, longitude: lo }
}

// fotos do carrossel: só links enviados pelo app, até 6; a primeira também vai para photo_url (telas antigas)
const MAX_PHOTOS = 6
function photoFields(photos) {
  if (!Array.isArray(photos)) return {}
  const list = photos.filter(u => typeof u === 'string' && /^\/uploads\/[\w.-]+$/.test(u)).slice(0, MAX_PHOTOS)
  if (!list.length) return {}
  return { photos: JSON.stringify(list), photo_url: list[0] }
}

function parsePhotos(i) {
  try {
    const list = JSON.parse(i.photos || '[]')
    if (Array.isArray(list) && list.length) return list
  } catch { /* coluna vazia ou antiga */ }
  return i.photo_url ? [i.photo_url] : []
}

// campanha em andamento mais recente (dentro do prazo e sem ter batido a meta)
async function activeCampaign(institutionId) {
  const today = new Date().toISOString().slice(0, 10)
  const list = await db('posts').where({ institution_id: institutionId, type: 'campaign' }).orderBy('created_at', 'desc').limit(20)
  const c = list.find(p => (!p.campaign_deadline || p.campaign_deadline >= today) && (p.campaign_current || 0) < (p.campaign_goal || 0))
  return c ? { id: c.id, title: c.title || 'Campanha', goal: c.campaign_goal, current: c.campaign_current || 0, deadline: c.campaign_deadline || null } : null
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
    photos: parsePhotos(i),
    cnpj: i.cnpj,
    phone: i.contact_phone,
    address: (i.street || i.city) ? { street: i.street || '', city: i.city || '', state: i.state || '', zipCode: i.zip || '' } : undefined,
    city: i.city || '',
    state: i.state || '',
    email: i.contact_email || undefined,
    openingHours: i.opening_hours || undefined,
    latitude: i.latitude ?? undefined,
    longitude: i.longitude ?? undefined,
    audience: i.audience || undefined,
    mission: i.mission,
    history: i.history,
    foundedYear: i.founded_year,
  }
}

module.exports = router
