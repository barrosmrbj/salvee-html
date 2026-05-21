const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// GET /api/feed?page=1
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = 20
    const offset = (page - 1) * limit

    const posts = await db('posts')
      .join('institutions', 'posts.institution_id', 'institutions.id')
      .select(
        'posts.*',
        'institutions.name as institution_name',
        'institutions.verified as institution_verified',
        'institutions.logo_url as institution_logo_url'
      )
      .orderBy('posts.created_at', 'desc')
      .limit(limit)
      .offset(offset)

    res.json(posts.map(formatPost))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/feed/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await db('posts')
      .join('institutions', 'posts.institution_id', 'institutions.id')
      .select(
        'posts.*',
        'institutions.name as institution_name',
        'institutions.verified as institution_verified',
        'institutions.logo_url as institution_logo_url'
      )
      .where('posts.id', req.params.id)
      .first()

    if (!post) return res.status(404).json({ error: 'Post não encontrado' })
    res.json(formatPost(post))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

function formatPost(p) {
  return {
    id: p.id,
    institutionId: p.institution_id,
    institutionName: p.institution_name,
    institutionVerified: Boolean(p.institution_verified),
    institutionLogoUrl: p.institution_logo_url,
    type: p.type,
    content: p.content,
    imageUrl: p.image_url,
    campaignGoal: p.campaign_goal,
    campaignCurrent: p.campaign_current,
    eventDate: p.event_date,
    eventLocation: p.event_location,
    createdAt: p.created_at,
  }
}

module.exports = router
