const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { institutionId, amount, message } = req.body
    if (!institutionId || !amount) return res.status(400).json({ error: 'Campos obrigatórios' })

    const value = Number(amount)
    if (!Number.isInteger(value) || value <= 0) return res.status(400).json({ error: 'Valor inválido' })

    // A doação nasce pendente: XP/Salves ficam reservados e só são creditados quando o pagamento
    // for confirmado (hoje por admin/gestor em PATCH /admin/donations/:id/status).
    const xpEarned = Math.floor(value / 2)
    const salvesEarned = Math.floor(value / 4)
    const id = uuidv4()

    await db('donations').insert({
      id, user_id: req.userId, institution_id: institutionId,
      amount: value, payment_method: 'pix', // único método ativo na V1 (spec 14.5)
      anonymous: 0, // doação anônima fora da V1 (spec 14.10)
      message, xp_earned: xpEarned, salves_earned: salvesEarned,
      status: 'pending',
    })

    res.json({ donationId: id, xpEarned, salvesEarned, status: 'pending' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const list = await db('donations')
      .leftJoin('institutions', 'donations.institution_id', 'institutions.id')
      .where('donations.user_id', req.userId)
      .orderBy('donations.created_at', 'desc')
      .select(
        'donations.id', 'donations.institution_id', 'donations.amount',
        'donations.payment_method', 'donations.anonymous',
        'donations.xp_earned', 'donations.salves_earned', 'donations.status', 'donations.created_at',
        'institutions.name as institution_name', 'institutions.logo_url as institution_logo_url'
      )
    res.json(list.map(d => ({
      id: d.id,
      institutionId: d.institution_id,
      institutionName: d.institution_name ?? 'Instituição',
      institutionLogoUrl: d.institution_logo_url ?? null,
      amount: d.amount,
      paymentMethod: d.payment_method,
      anonymous: Boolean(d.anonymous),
      xpEarned: d.xp_earned,
      salvesEarned: d.salves_earned,
      status: d.status || 'confirmed',
      createdAt: d.created_at,
    })))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
