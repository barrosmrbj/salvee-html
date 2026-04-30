const express = require('express')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const level = Math.floor(user.xp / 100) + 1
    const xpToNextLevel = (level * 100) - user.xp

    res.json({ xp: user.xp, salves: user.salves, level, xpToNextLevel, levelName: `Nível ${level}` })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const rewards = await db('rewards').orderBy('cost')
    res.json(rewards.map(r => ({
      id: r.id, title: r.title, description: r.description,
      cost: r.cost, partnerName: r.partner_name, partnerLogoUrl: r.partner_logo_url,
    })))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/rewards/:id/redeem', authMiddleware, async (req, res) => {
  try {
    const reward = await db('rewards').where({ id: req.params.id }).first()
    if (!reward) return res.status(404).json({ error: 'Recompensa não encontrada' })

    const user = await db('users').where({ id: req.userId }).first()
    if (user.salves < reward.cost) return res.status(400).json({ error: 'Salves insuficientes' })

    await db('users').where({ id: req.userId }).decrement('salves', reward.cost)
    res.json({ ok: true, qrCode: `SALVEE-${req.userId}-${reward.id}-${Date.now()}` })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
