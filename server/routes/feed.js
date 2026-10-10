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

// Dados do usuário e contagens para os posts dados: eventos em que confirmou presença,
// posts que curtiu, total de curtidas e de comentários.
async function postStats(userId, posts) {
  const ids = posts.map(p => p.id)
  const stats = { registered: new Set(), liked: new Set(), likes: new Map(), comments: new Map() }
  if (!ids.length) return stats
  const eventIds = posts.filter(p => p.type === 'event').map(p => p.id)
  const [regs, mine, likeCounts, commentCounts] = await Promise.all([
    eventIds.length ? db('calendar_registrations').where({ user_id: userId }).whereIn('post_id', eventIds).select('post_id') : [],
    db('post_likes').where({ user_id: userId }).whereIn('post_id', ids).select('post_id'),
    db('post_likes').whereIn('post_id', ids).groupBy('post_id').select('post_id').count({ n: '*' }),
    db('post_comments').whereIn('post_id', ids).groupBy('post_id').select('post_id').count({ n: '*' }),
  ])
  regs.forEach(r => stats.registered.add(r.post_id))
  mine.forEach(r => stats.liked.add(r.post_id))
  likeCounts.forEach(r => stats.likes.set(r.post_id, Number(r.n)))
  commentCounts.forEach(r => stats.comments.set(r.post_id, Number(r.n)))
  return stats
}

// post visível (instituição aprovada) ou undefined
const visiblePost = id => postsQuery().where('posts.id', id).first()

// GET /api/feed?page=1&institutionId=... (institutionId = mural do perfil da instituição)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = 20
    let query = postsQuery()
    if (req.query.institutionId) query = query.where('posts.institution_id', String(req.query.institutionId))
    // aba "Seguindo": só instituições que o usuário segue (spec 11.2)
    if (req.query.seguindo === '1') {
      query = query.whereIn('posts.institution_id', db('institution_follows').where({ user_id: req.userId }).select('institution_id'))
    }
    const posts = await query.orderBy('posts.created_at', 'desc').limit(limit).offset((page - 1) * limit)
    const stats = await postStats(req.userId, posts)
    res.json(posts.map(p => formatPost(p, req.userId, stats)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/feed/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await visiblePost(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    const result = formatPost(post, req.userId, await postStats(req.userId, [post]))
    // tela da campanha (spec 15.4): quantas doações confirmadas ela recebeu
    if (post.type === 'campaign') {
      const row = await db('donations').where({ post_id: post.id, status: 'confirmed' }).count({ n: '*' }).first()
      result.campaignDonations = Number(row?.n || 0)
    }
    res.json(result)
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
    res.status(201).json(formatPost(post, req.userId, await postStats(req.userId, [post])))
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
    res.json(formatPost(post, req.userId, await postStats(req.userId, [post])))
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
      await trx('post_likes').where({ post_id: post.id }).delete()
      await trx('post_comments').where({ post_id: post.id }).delete()
      await trx('posts').where({ id: post.id }).delete()
    })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// ---- curtidas (spec 11.8) ----

async function likeCount(postId) {
  const row = await db('post_likes').where({ post_id: postId }).count({ n: '*' }).first()
  return Number(row?.n || 0)
}

// POST /api/feed/:id/like — curtir (repetir não duplica)
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    if (!(await visiblePost(req.params.id))) return res.status(404).json({ error: 'Post não encontrado' })
    const exists = await db('post_likes').where({ post_id: req.params.id, user_id: req.userId }).first()
    if (!exists) {
      await db('post_likes').insert({ id: uuidv4(), post_id: req.params.id, user_id: req.userId })
        .catch(err => { if (!/unique|duplicate/i.test(err.message)) throw err }) // dois toques ao mesmo tempo
    }
    res.json({ liked: true, likeCount: await likeCount(req.params.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/feed/:id/like — desfazer a curtida
router.delete('/:id/like', authMiddleware, async (req, res) => {
  try {
    await db('post_likes').where({ post_id: req.params.id, user_id: req.userId }).delete()
    res.json({ liked: false, likeCount: await likeCount(req.params.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// ---- comentários (spec 11.8) ----
const MAX_COMMENT = 500

// pode apagar: o autor do comentário, o responsável pela instituição do post e admin/gestor (moderação)
function canDeleteComment(userId, comment, post, user) {
  if (comment.user_id === userId) return true
  if (post && post.institution_responsible_user_id === userId) return true
  return Boolean(user && ['admin', 'gestor'].includes(user.role))
}

function formatComment(c, canDelete) {
  return {
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    userName: c.user_name || 'Usuário',
    userAvatarUrl: c.user_avatar_url || null,
    content: c.content,
    createdAt: c.created_at,
    canDelete,
  }
}

const commentsQuery = () => db('post_comments')
  .leftJoin('users', 'post_comments.user_id', 'users.id')
  .select('post_comments.*', 'users.name as user_name', 'users.avatar_url as user_avatar_url')

// GET /api/feed/:id/comments — do mais antigo para o mais novo
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const post = await visiblePost(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    const user = await db('users').where({ id: req.userId }).first()
    const rows = await commentsQuery().where('post_comments.post_id', post.id).orderBy('post_comments.created_at', 'asc')
    res.json(rows.map(c => formatComment(c, canDeleteComment(req.userId, c, post, user))))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/feed/:id/comments  { content }
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
    if (!content) return res.status(400).json({ error: 'Escreva o comentário' })
    if (content.length > MAX_COMMENT) return res.status(400).json({ error: 'Comentário muito longo (máximo ' + MAX_COMMENT + ' caracteres)' })
    const post = await visiblePost(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    const id = uuidv4()
    await db('post_comments').insert({ id, post_id: post.id, user_id: req.userId, content })
    const c = await commentsQuery().where('post_comments.id', id).first()
    res.status(201).json(formatComment(c, true))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/feed/comments/:commentId
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await db('post_comments').where({ id: req.params.commentId }).first()
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' })
    const post = await postsQuery().where('posts.id', comment.post_id).first()
    const user = await db('users').where({ id: req.userId }).first()
    if (!canDeleteComment(req.userId, comment, post, user)) {
      return res.status(403).json({ error: 'Você não pode apagar este comentário' })
    }
    await db('post_comments').where({ id: comment.id }).delete()
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

function formatPost(p, userId, stats) {
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
    registered: stats.registered.has(p.id),
    liked: stats.liked.has(p.id),
    likeCount: stats.likes.get(p.id) || 0,
    commentCount: stats.comments.get(p.id) || 0,
    canEdit: Boolean(userId && p.institution_responsible_user_id === userId),
    createdAt: p.created_at,
  }
}

module.exports = router
