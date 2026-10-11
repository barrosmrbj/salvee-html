// Gamificação (spec 18): saldo e nível, regra de pontos vigente, recompensas, resgate com QR Code
// único e "Minhas recompensas". A validação no parceiro fica em routes/admin.js (admin/gestor).
const express = require('express')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')
const { getSetting, promoActive } = require('../settings')

const router = express.Router()

const levelOf = xp => Math.floor((xp || 0) / 100) + 1
const today = () => new Date().toISOString().slice(0, 10)

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    const level = levelOf(user.xp)
    res.json({ xp: user.xp, salves: user.salves, level, xpToNextLevel: level * 100 - user.xp, levelName: `Nível ${level}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /gamification/rules — regra vigente (tela de doação mostra a pontuação estimada)
router.get('/rules', authMiddleware, async (req, res) => {
  try {
    const [points, rewards] = await Promise.all([getSetting('points'), getSetting('rewards')])
    const promo = promoActive(points.promo) ? points.promo : null
    res.json({
      pointsEnabled: points.enabled,
      reaisPerXp: points.reaisPerXp,
      reaisPerSalve: points.reaisPerSalve,
      promo: promo ? { label: promo.label || '', xpMultiplier: promo.xpMultiplier, salvesMultiplier: promo.salvesMultiplier, endsAt: promo.endsAt } : null,
      rewardsEnabled: rewards.enabled,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

function formatReward(r, user, rewardsEnabled) {
  const level = levelOf(user?.xp)
  let reason = null // por que não dá para resgatar agora
  if (!rewardsEnabled) reason = 'Resgates temporariamente indisponíveis'
  else if ((r.min_level || 0) > level) reason = `Disponível a partir do nível ${r.min_level}`
  else if ((user?.salves || 0) < r.cost) reason = `Faltam ${r.cost - (user?.salves || 0)} Salves`
  return {
    id: r.id, title: r.title, description: r.description || '', cost: r.cost,
    partnerName: r.partner_name || '', partnerLogoUrl: r.partner_logo_url || null,
    rewardType: r.reward_type || '', minLevel: r.min_level || 0, validUntil: r.valid_until || null,
    canRedeem: !reason, reason,
  }
}

// GET /gamification/rewards — "Disponíveis": ativas e dentro da validade
router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const [user, settings, list] = await Promise.all([
      db('users').where({ id: req.userId }).first(),
      getSetting('rewards'),
      db('rewards').orderBy('cost'),
    ])
    const t = today()
    res.json(list.filter(r => r.active !== 0 && r.active !== false && (!r.valid_until || r.valid_until >= t))
      .map(r => formatReward(r, user, settings.enabled)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// código do QR: 10 caracteres sem letras/números parecidos (0/O, 1/I), fácil de digitar se a câmera falhar
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function newCode() {
  const bytes = crypto.randomBytes(10)
  return 'SLV-' + Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

// POST /gamification/rewards/:id/redeem — spec 18.8: confere Salves e nível, desconta, gera QR único
router.post('/rewards/:id/redeem', authMiddleware, async (req, res) => {
  try {
    const settings = await getSetting('rewards')
    if (!settings.enabled) return res.status(503).json({ error: 'Resgates temporariamente indisponíveis' })
    const reward = await db('rewards').where({ id: req.params.id }).first()
    const t = today()
    if (!reward || reward.active === 0 || reward.active === false || (reward.valid_until && reward.valid_until < t)) {
      return res.status(404).json({ error: 'Recompensa não disponível' })
    }

    const result = await db.transaction(async trx => {
      const user = await trx('users').where({ id: req.userId }).first()
      if ((reward.min_level || 0) > levelOf(user.xp)) return { code: 403, error: `Disponível a partir do nível ${reward.min_level}` }
      // desconta só se ainda houver saldo (protege contra dois toques ao mesmo tempo)
      const changed = await trx('users').where({ id: req.userId }).where('salves', '>=', reward.cost).decrement('salves', reward.cost)
      if (!changed) return { code: 400, error: 'Salves insuficientes' }
      const id = uuidv4()
      let code = newCode()
      while (await trx('user_rewards').where({ code }).first()) code = newCode()
      await trx('user_rewards').insert({ id, user_id: req.userId, reward_id: reward.id, code, cost_paid: reward.cost, expires_at: reward.valid_until || null })
      return { code: 201, id }
    })
    if (result.error) return res.status(result.code).json({ error: result.error })
    const row = await myRewardsQuery().where('user_rewards.id', result.id).first()
    res.status(201).json(formatMyReward(row))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

const myRewardsQuery = () => db('user_rewards')
  .leftJoin('rewards', 'user_rewards.reward_id', 'rewards.id')
  .select('user_rewards.*', 'rewards.title', 'rewards.description', 'rewards.partner_name', 'rewards.partner_logo_url', 'rewards.reward_type')

// status (spec 18.7): disponível, usada ou vencida
function formatMyReward(r) {
  const status = r.used_at ? 'used' : (r.expires_at && r.expires_at < today() ? 'expired' : 'available')
  return {
    id: r.id, rewardId: r.reward_id, code: r.code, status,
    title: r.title || 'Recompensa', description: r.description || '', partnerName: r.partner_name || '',
    partnerLogoUrl: r.partner_logo_url || null, rewardType: r.reward_type || '',
    costPaid: r.cost_paid, expiresAt: r.expires_at || null, usedAt: r.used_at || null, redeemedAt: r.created_at,
  }
}

// GET /gamification/my-rewards — "Minhas recompensas"
router.get('/my-rewards', authMiddleware, async (req, res) => {
  try {
    const rows = await myRewardsQuery().where('user_rewards.user_id', req.userId).orderBy('user_rewards.created_at', 'desc')
    const order = { available: 0, used: 1, expired: 2 }
    res.json(rows.map(formatMyReward).sort((a, b) => order[a.status] - order[b.status]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
module.exports.formatMyReward = formatMyReward
module.exports.myRewardsQuery = myRewardsQuery
