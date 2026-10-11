// Configurações do sistema ajustáveis pelo admin (tabela settings, valor em JSON).
// Regra de pontos configurável (spec 18.11 e 27.6): liga/desliga, R$ por XP e por Salve e
// promoção com multiplicador e período. Recompensas: liga/desliga o resgate para todos.
const { db } = require('./db')

const DEFAULTS = {
  points: {
    enabled: true,
    reaisPerXp: 2,     // 1 XP a cada R$ 2 doados (regra que estava fixa no código)
    reaisPerSalve: 4,  // 1 Salve a cada R$ 4
    promo: {
      enabled: false,
      label: '',
      xpMultiplier: 1,
      salvesMultiplier: 2,
      startsAt: null,  // AAAA-MM-DD
      endsAt: null,
    },
  },
  rewards: { enabled: true },
}

async function getSetting(key) {
  const row = await db('settings').where({ key }).first()
  let value = {}
  try { value = row ? JSON.parse(row.value) : {} } catch { value = {} }
  // mescla com o padrão (inclusive o objeto promo), para campos novos terem valor
  const base = DEFAULTS[key] || {}
  const merged = { ...base, ...value }
  if (base.promo) merged.promo = { ...base.promo, ...(value.promo || {}) }
  return merged
}

async function setSetting(key, value, userId) {
  const json = JSON.stringify(value)
  const exists = await db('settings').where({ key }).first()
  if (exists) await db('settings').where({ key }).update({ value: json, updated_by: userId, updated_at: new Date() })
  else await db('settings').insert({ key, value: json, updated_by: userId })
}

// promoção valendo hoje (ligada e dentro do período)
function promoActive(promo, today = new Date().toISOString().slice(0, 10)) {
  return Boolean(promo && promo.enabled && (!promo.startsAt || promo.startsAt <= today) && (!promo.endsAt || promo.endsAt >= today))
}

/** XP e Salves que uma doação de `amount` reais gera agora (0 se a pontuação estiver desligada) */
async function pointsFor(amount) {
  const p = await getSetting('points')
  if (!p.enabled) return { xp: 0, salves: 0 }
  const promo = promoActive(p.promo) ? p.promo : null
  const xp = Math.floor((amount / Math.max(0.01, Number(p.reaisPerXp) || 1)) * (promo ? Number(promo.xpMultiplier) || 1 : 1))
  const salves = Math.floor((amount / Math.max(0.01, Number(p.reaisPerSalve) || 1)) * (promo ? Number(promo.salvesMultiplier) || 1 : 1))
  return { xp, salves }
}

module.exports = { getSetting, setSetting, pointsFor, promoActive, DEFAULTS }
