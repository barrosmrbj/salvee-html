const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    const results = await db('institutions')
      .where('status', 'approved')
      .andWhere(function () {
        this.where('name', 'like', `%${q}%`)
          .orWhere('category', 'like', `%${q}%`)
          .orWhere('description', 'like', `%${q}%`)
      })
      .limit(20)

    res.json(results.map(i => ({
      id: i.id, name: i.name, category: i.category || '', verified: Boolean(i.verified),
      status: i.status, description: i.description || '', logoUrl: i.logo_url, photos: [],
    })))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/categories', authMiddleware, async (req, res) => {
  res.json(['Saúde', 'Crianças', 'Idosos', 'Animais', 'Educação', 'Meio Ambiente', 'Moradia', 'Alimentação'])
})

module.exports = router
