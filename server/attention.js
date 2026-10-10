// Redistribuição de atenção (spec 1.4, 4.4, 11.4 e 17.5): quanto cada instituição aprovada recebeu
// de ajuda recentemente. Quem recebeu menos sobe no feed ("Precisa de apoio"), nos Destaques e na busca.
// Regras simples calculadas no backend, como o PDF sugere para a V1 (sem IA).
const { db } = require('./db')

const RECENT_DAYS = 30

// Datas do SQLite vêm como texto "AAAA-MM-DD HH:MM:SS" (UTC); do MySQL, como Date.
function toTime(value) {
  if (!value) return 0
  if (value instanceof Date) return value.getTime()
  const s = String(value)
  return new Date(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(' ', 'T') + 'Z' : s).getTime() || 0
}

/**
 * Ranking de necessidade das instituições aprovadas.
 * @returns {Promise<{ need: Map<string, number>, stats: Map<string, { recentDonated: number, followers: number }>, ranked: string[] }>}
 *   need: 0 (mais atendida) a 1 (mais esquecida); ranked: ids do mais esquecido para o mais atendido.
 */
async function attentionRanking() {
  const since = Date.now() - RECENT_DAYS * 86400000
  const [institutions, donations, follows] = await Promise.all([
    db('institutions').where({ status: 'approved' }).select('id', 'created_at'),
    db('donations').where({ status: 'confirmed' }).select('institution_id', 'amount', 'created_at'),
    db('institution_follows').select('institution_id'),
  ])

  const stats = new Map(institutions.map(i => [i.id, { recentDonated: 0, followers: 0 }]))
  for (const d of donations) {
    const s = stats.get(d.institution_id)
    if (s && toTime(d.created_at) >= since) s.recentDonated += Number(d.amount) || 0
  }
  for (const f of follows) {
    const s = stats.get(f.institution_id)
    if (s) s.followers += 1
  }

  // menos doação recente primeiro; empate: menos seguidores; empate: a mais nova (menos conhecida)
  const created = new Map(institutions.map(i => [i.id, toTime(i.created_at)]))
  const ranked = [...stats.keys()].sort((a, b) => {
    const sa = stats.get(a), sb = stats.get(b)
    return sa.recentDonated - sb.recentDonated || sa.followers - sb.followers || created.get(b) - created.get(a)
  })
  // necessidade proporcional à atenção recebida (doações recentes + seguidores, R$ 20 por seguidor):
  // quem recebeu o máximo fica com 0, quem não recebeu nada com 1; todas iguais → todas 1 (sem favorecer ninguém)
  const weight = id => stats.get(id).recentDonated + 20 * stats.get(id).followers
  const max = Math.max(0, ...ranked.map(weight))
  const need = new Map(ranked.map(id => [id, max ? 1 - weight(id) / max : 1]))
  // balanced: ninguém recebeu atenção ainda → não há a quem dar destaque
  return { need, stats, ranked, balanced: max === 0 }
}

module.exports = { attentionRanking, toTime }
