// Busca e descoberta (spec 17): barra de pesquisa, categorias, destaques (em /institutions/destaques)
// e "Causas perto de você". Só instituições aprovadas e suas campanhas em andamento.
const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')
const { attentionRanking } = require('../attention')

const router = express.Router()

const DEFAULT_CATEGORIES = ['Saúde', 'Crianças', 'Idosos', 'Educação', 'Animais', 'Alimentação']

function parseImages(p) {
  try {
    const list = JSON.parse(p.images || '[]')
    if (Array.isArray(list) && list.length) return list
  } catch { /* coluna vazia */ }
  return p.image_url ? [p.image_url] : []
}

function formatInstitution(i) {
  return {
    id: i.id, name: i.name, category: i.category || '', verified: Boolean(i.verified), status: i.status,
    description: i.description || '', logoUrl: i.logo_url || null, city: i.city || '', state: i.state || '', photos: [],
  }
}

function formatCampaign(p) {
  return {
    id: p.id,
    title: p.title || (p.content || '').slice(0, 60),
    institutionId: p.institution_id,
    institutionName: p.institution_name,
    institutionLogoUrl: p.institution_logo_url || null,
    category: p.institution_category || '',
    city: p.institution_city || '',
    state: p.institution_state || '',
    imageUrl: parseImages(p)[0] || null,
    goal: p.campaign_goal || 0,
    current: p.campaign_current || 0,
    deadline: p.campaign_deadline || null,
  }
}

// campanhas de instituições aprovadas, dentro do prazo e sem ter batido a meta
async function activeCampaigns({ q, category } = {}) {
  let query = db('posts')
    .join('institutions', 'posts.institution_id', 'institutions.id')
    .where('posts.type', 'campaign')
    .where('institutions.status', 'approved')
    .select('posts.*', 'institutions.name as institution_name', 'institutions.logo_url as institution_logo_url',
      'institutions.category as institution_category', 'institutions.city as institution_city', 'institutions.state as institution_state')
  if (category) query = query.where('institutions.category', category)
  if (q) {
    query = query.andWhere(function () {
      this.where('posts.title', 'like', `%${q}%`).orWhere('posts.content', 'like', `%${q}%`).orWhere('institutions.name', 'like', `%${q}%`)
    })
  }
  const today = new Date().toISOString().slice(0, 10)
  const rows = await query.orderBy('posts.created_at', 'desc').limit(100)
  return rows.filter(p => (!p.campaign_deadline || p.campaign_deadline >= today) && (p.campaign_current || 0) < (p.campaign_goal || 0))
}

// GET /search?q=&category= → { institutions, campaigns }
// Entre os resultados, quem recebeu menos atenção recente vem primeiro (spec 4.4).
router.get('/', authMiddleware, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    const category = String(req.query.category || '').trim()
    if (!q && !category) return res.json({ institutions: [], campaigns: [] })

    let query = db('institutions').where('status', 'approved')
    if (category) query = query.where('category', category)
    if (q) {
      query = query.andWhere(function () {
        this.where('name', 'like', `%${q}%`).orWhere('category', 'like', `%${q}%`).orWhere('subcategory', 'like', `%${q}%`)
          .orWhere('description', 'like', `%${q}%`).orWhere('city', 'like', `%${q}%`).orWhere('audience', 'like', `%${q}%`)
      })
    }
    const [institutions, campaigns, attention] = await Promise.all([query.limit(50), activeCampaigns({ q, category }), attentionRanking()])

    // nome que começa com o termo vem antes; depois, os menos ajudados
    const qLower = q.toLowerCase()
    const starts = i => (q && String(i.name).toLowerCase().startsWith(qLower) ? 1 : 0)
    const need = id => attention.need.get(id) ?? 0
    institutions.sort((a, b) => starts(b) - starts(a) || need(b.id) - need(a.id))
    campaigns.sort((a, b) => need(b.institution_id) - need(a.institution_id))

    res.json({ institutions: institutions.slice(0, 20).map(formatInstitution), campaigns: campaigns.slice(0, 20).map(formatCampaign) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /search/categories → [{ name, count }] das instituições aprovadas (as mais usadas primeiro)
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const rows = await db('institutions').where({ status: 'approved' }).whereNotNull('category').whereNot('category', '')
      .groupBy('category').select('category').count({ n: '*' })
    const list = rows.map(r => ({ name: r.category, count: Number(r.n) })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    // sem instituições ainda: categorias padrão, para a tela não ficar vazia
    res.json(list.length ? list : DEFAULT_CATEGORIES.map(name => ({ name, count: 0 })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /search/cities → cidades com instituição aprovada (para "Causas perto de você")
router.get('/cities', authMiddleware, async (req, res) => {
  try {
    const rows = await db('institutions').where({ status: 'approved' }).whereNotNull('city').whereNot('city', '')
      .distinct('city', 'state').orderBy('city')
    res.json(rows.map(r => ({ city: r.city, state: r.state || '' })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /search/causas?category=&city= → campanhas em andamento (spec 17.6).
// Sem coordenadas cadastradas, "perto" = mesma cidade (fallback do PDF: pedir a cidade).
// Ordem: cidade escolhida primeiro, depois quem recebeu menos, depois prazo mais próximo.
router.get('/causas', authMiddleware, async (req, res) => {
  try {
    const category = String(req.query.category || '').trim()
    const city = String(req.query.city || '').trim().toLowerCase()
    const [campaigns, attention] = await Promise.all([activeCampaigns({ category }), attentionRanking()])
    const sameCity = p => (city && String(p.institution_city || '').toLowerCase() === city ? 1 : 0)
    const need = p => attention.need.get(p.institution_id) ?? 0
    const deadline = p => p.campaign_deadline || '9999-12-31'
    campaigns.sort((a, b) => sameCity(b) - sameCity(a) || need(b) - need(a) || deadline(a).localeCompare(deadline(b)))
    res.json(campaigns.slice(0, 30).map(p => ({ ...formatCampaign(p), nearby: Boolean(sameCity(p)) })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
