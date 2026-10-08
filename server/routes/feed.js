const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

const POST_TYPES = ['common', 'event', 'campaign']
const MAX_IMAGES = 5

function postsQuery() {
  return db('posts')
    .join('institutions', 'posts.institution_id', 'institutions.id')
    // só instituições aprovadas aparecem publicamente (spec 4.3 e 11.10)
    .where('institutions.status', 'approved')
    .select(
      'posts.*',
      'institutions.name as institution_name',
      'institutions.verified as institution_verified',
      'institutions.logo_url as institution_logo_url',
      'institutions.responsible_user_id as institution_responsible_user_id'
    )
}

// ids dos eventos (entre os posts dados) em que o usuário confirmou presença
async function registeredIds(userId, posts) {
  const eventIds = posts.filter(p => p.type === 'event').map(p => p.id)
  if (!eventIds.length) return new Set()
  const rows = await db('calendar_registrations').where({ user_id: userId }).whereIn('post_id', eventIds).select('post_id')
  return new Set(rows.map(r => r.post_id))
}

// GET /api/feed?page=1&institutionId=... (institutionId = mural do perfil da instituição)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = 20
    let query = postsQuery()
    if (req.query.institutionId) query = query.where('posts.institution_id', String(req.query.institutionId))
    const posts = await query.orderBy('posts.created_at', 'desc').limit(limit).offset((page - 1) * limit)
    const registered = await registeredIds(req.userId, posts)
    res.json(posts.map(p => formatPost(p, req.userId, registered)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/feed/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await postsQuery().where('posts.id', req.params.id).first()
    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    res.json(formatPost(post, req.userId, await registeredIds(req.userId, [post])))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// Só o responsável por uma instituição APROVADA publica por ela (spec 12.1 e 23.3).
async function institutionForAuthor(userId, institutionId, denied = 'Você não pode publicar por esta instituição') {
  const inst = await db('institutions').where({ id: institutionId }).first()
  if (!inst || inst.responsible_user_id !== userId) return { error: denied, code: 403 }
  if (inst.status !== 'approved') return { error: 'A instituição precisa estar aprovada para publicar', code: 403 }
  return { inst }
}

// Valida e converte o corpo da requisição nas colunas de posts. type vem do post (edição) ou do corpo.
function postFields(body, type) {
  const text = v => (typeof v === 'string' ? v.trim() : '')
  const content = text(body.content)
  const title = text(body.title)
  if (!content) return { error: 'Escreva o texto da publicação' }
  if (content.length > 5000) return { error: 'Texto muito longo (máximo 5.000 caracteres)' }
  if (title.length > 120) return { error: 'Título muito longo (máximo 120 caracteres)' }

  const images = Array.isArray(body.images) ? body.images : []
  if (images.length > MAX_IMAGES) return { error: `No máximo ${MAX_IMAGES} imagens` }
  // só imagens enviadas pelo próprio app (/uploads/...): nada de link externo no feed
  if (!images.every(u => typeof u === 'string' && /^\/uploads\/[\w.-]+$/.test(u))) return { error: 'Imagem inválida' }

  const fields = {
    title: title || null,
    content,
    images: JSON.stringify(images),
    image_url: images[0] || null, // primeira imagem: compatibilidade com telas antigas e calendário
    campaign_goal: null,
    campaign_deadline: null,
    event_date: null,
    event_location: null,
    event_instructions: null,
  }

  if (type === 'campaign') {
    const goal = Number(body.campaignGoal)
    if (!title) return { error: 'Informe o título da campanha' }
    if (!Number.isInteger(goal) || goal <= 0) return { error: 'Informe a meta em reais (número inteiro)' }
    const deadline = text(body.campaignDeadline)
    if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { error: 'Prazo inválido' }
    fields.campaign_goal = goal
    fields.campaign_deadline = deadline || null
  }

  if (type === 'event') {
    const date = text(body.eventDate)
    const location = text(body.eventLocation)
    if (!title) return { error: 'Informe o título do evento' }
    if (!date || Number.isNaN(new Date(date).getTime())) return { error: 'Informe a data e o horário do evento' }
    if (!location) return { error: 'Informe o local do evento' }
    fields.event_date = new Date(date).toISOString()
    fields.event_location = location
    fields.event_instructions = text(body.eventInstructions) || null
  }

  return { fields }
}

// POST /api/feed  { institutionId, type, title, content, images[], campaignGoal, campaignDeadline, eventDate, eventLocation, eventInstructions }
router.post('/', authMiddleware, async (req, res) => {
  try {
    const type = req.body.type
    if (!POST_TYPES.includes(type)) return res.status(400).json({ error: 'Tipo inválido' })
    const { inst, error, code } = await institutionForAuthor(req.userId, req.body.institutionId)
    if (error) return res.status(code).json({ error })
    const parsed = postFields(req.body, type)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const id = uuidv4()
    await db('posts').insert({ id, institution_id: inst.id, type, created_by: req.userId, campaign_current: 0, ...parsed.fields })
    const post = await postsQuery().where('posts.id', id).first()
    res.status(201).json(formatPost(post, req.userId, new Set()))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PATCH /api/feed/:id  (o tipo não muda; instituição continua a mesma)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const current = await db('posts').where({ id: req.params.id }).first()
    if (!current) return res.status(404).json({ error: 'Post não encontrado' })
    const { error, code } = await institutionForAuthor(req.userId, current.institution_id, 'Você não pode alterar esta publicação')
    if (error) return res.status(code).json({ error })
    const parsed = postFields(req.body, current.type)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    await db('posts').where({ id: current.id }).update({ ...parsed.fields, updated_at: new Date() })
    const post = await postsQuery().where('posts.id', current.id).first()
    res.json(formatPost(post, req.userId, await registeredIds(req.userId, [post])))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/feed/:id  — o responsável pela instituição; admin/gestor também (moderação, spec 22.1)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await db('posts').where({ id: req.params.id }).first()
    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    const inst = await db('institutions').where({ id: post.institution_id }).first()
    const user = await db('users').where({ id: req.userId }).first()
    const isOwner = inst && inst.responsible_user_id === req.userId
    if (!isOwner && !(user && ['admin', 'gestor'].includes(user.role))) {
      return res.status(403).json({ error: 'Você não pode excluir esta publicação' })
    }
    await db.transaction(async trx => {
      await trx('calendar_registrations').where({ post_id: post.id }).delete()
      await trx('posts').where({ id: post.id }).delete()
    })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

function parseImages(p) {
  try {
    const list = JSON.parse(p.images || '[]')
    if (Array.isArray(list) && list.length) return list
  } catch { /* coluna antiga ou vazia */ }
  return p.image_url ? [p.image_url] : []
}

function formatPost(p, userId, registered) {
  return {
    id: p.id,
    institutionId: p.institution_id,
    institutionName: p.institution_name,
    institutionVerified: Boolean(p.institution_verified),
    institutionLogoUrl: p.institution_logo_url,
    type: p.type,
    title: p.title || null,
    content: p.content,
    imageUrl: p.image_url,
    images: parseImages(p),
    campaignGoal: p.campaign_goal,
    campaignCurrent: p.campaign_current || 0,
    campaignDeadline: p.campaign_deadline || null,
    eventDate: p.event_date,
    eventLocation: p.event_location,
    eventInstructions: p.event_instructions || null,
    registered: registered.has(p.id),
    canEdit: Boolean(userId && p.institution_responsible_user_id === userId),
    createdAt: p.created_at,
  }
}

module.exports = router
