const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/my-events', authMiddleware, async (req, res) => {
  try {
    const regs = await db('calendar_registrations')
      .join('posts', 'calendar_registrations.post_id', 'posts.id')
      .join('institutions', 'posts.institution_id', 'institutions.id')
      .where('calendar_registrations.user_id', req.userId)
      .where('posts.type', 'event')
      .select('posts.*', 'institutions.name as institution_name', 'institutions.category as category')
      .orderBy('posts.event_date')

    res.json(regs.map(p => ({
      id: p.id, institutionId: p.institution_id, institutionName: p.institution_name,
      title: p.content.slice(0, 60), date: p.event_date || p.created_at,
      location: p.event_location || '', registered: true,
      category: p.category || null, imageUrl: p.image_url || null,
    })))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/events/:id/register', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4()
    await db('calendar_registrations').insert({ id, user_id: req.userId, post_id: req.params.id })
    res.json({ ok: true })
  } catch {
    res.status(409).json({ error: 'Já registrado' })
  }
})

router.delete('/events/:id/register', authMiddleware, async (req, res) => {
  try {
    await db('calendar_registrations').where({ user_id: req.userId, post_id: req.params.id }).delete()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
