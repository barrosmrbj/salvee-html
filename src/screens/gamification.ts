// src/screens/gamification.ts — #/gamification, aba "Prêmios" (spec 18 e mockup: troféu na barra de baixo)
// Topo: avatar, nome, nível, barra até o próximo nível, XP e Salves. Abas: Disponíveis e Minhas recompensas.
import { Avatar, BottomNav, Spinner, showRewardQr, showToast } from '@/components'
import { authService, gamificationService } from '@/services'
import { ApiError } from '@/services/api'
import type { GameRules, MyReward, Reward } from '@/types'

type Tab = 'available' | 'mine'
let tab: Tab = 'available'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-30">
      <h1 class="text-xl font-bold text-gray-900">Prêmios</h1>
    </header>
    <div id="game-top" class="bg-white px-4 pb-5 border-b border-gray-100"></div>
    <div id="game-promo"></div>
    <div class="flex bg-white border-b border-gray-100" role="tablist">
      <button id="tab-available" role="tab" class="flex-1 py-3 text-sm font-semibold border-b-2">Disponíveis</button>
      <button id="tab-mine" role="tab" class="flex-1 py-3 text-sm font-semibold border-b-2">Minhas recompensas</button>
    </div>
    <div id="game-list" class="flex flex-col gap-3 p-4 pb-28"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  document.getElementById('tab-available')!.addEventListener('click', () => { tab = 'available'; paintTabs(); void loadList() })
  document.getElementById('tab-mine')!.addEventListener('click', () => { tab = 'mine'; paintTabs(); void loadList() })
  paintTabs()
  void loadTop()
  void loadList()
}

function paintTabs(): void {
  for (const [id, t] of [['tab-available', 'available'], ['tab-mine', 'mine']] as const) {
    const b = document.getElementById(id)!
    const active = tab === t
    b.className = `flex-1 py-3 text-sm font-semibold border-b-2 ${active ? 'text-salvee-orange border-salvee-orange' : 'text-gray-400 border-transparent'}`
    b.setAttribute('aria-selected', String(active))
  }
}

// topo (spec 18.4): nome, avatar, nível, progresso, XP atual/necessário e Salves
async function loadTop(): Promise<void> {
  const top = document.getElementById('game-top')!
  top.appendChild(Spinner())
  try {
    const [user, bal, rules] = await Promise.all([authService.getMe(), gamificationService.getBalance(), gamificationService.getRules().catch(() => null)])
    top.innerHTML = ''
    const row = document.createElement('div')
    row.className = 'flex items-center gap-3 pt-4'
    row.appendChild(Avatar(user.name, user.avatarUrl, 'lg'))
    const info = document.createElement('div')
    info.className = 'flex-1 min-w-0'
    const name = document.createElement('p')
    name.className = 'font-bold text-gray-900 truncate'
    name.textContent = user.name
    const level = document.createElement('p')
    level.className = 'text-sm font-semibold text-salvee-orange'
    level.textContent = `Nível ${bal.level}`
    info.append(name, level)
    row.appendChild(info)
    top.appendChild(row)

    const levelStart = (bal.level - 1) * 100
    const levelEnd = bal.level * 100
    const pct = Math.min(100, Math.round(((bal.xp - levelStart) / (levelEnd - levelStart)) * 100))
    const bar = document.createElement('div')
    bar.className = 'mt-4'
    bar.innerHTML = `
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span><b class="text-gray-900">${bal.xp}</b>/${levelEnd} XP</span><span>faltam ${bal.xpToNextLevel} para o nível ${bal.level + 1}</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2.5"><div class="bg-salvee-orange h-2.5 rounded-full" style="width:${pct}%"></div></div>`
    top.appendChild(bar)

    const stats = document.createElement('div')
    stats.className = 'grid grid-cols-2 gap-3 mt-4'
    stats.innerHTML = `
      <div class="bg-salvee-orange-bg rounded-2xl p-3 text-center"><p class="text-2xl font-bold text-salvee-orange">${bal.salves}</p><p class="text-xs text-gray-500">Salves para trocar</p></div>
      <div class="bg-gray-50 rounded-2xl p-3 text-center"><p class="text-2xl font-bold text-gray-900">${bal.xp}</p><p class="text-xs text-gray-500">XP total</p></div>`
    top.appendChild(stats)
    renderPromo(rules)
  } catch {
    top.innerHTML = '<p class="text-sm text-gray-400 py-6 text-center">Não foi possível carregar seus pontos.</p>'
  }
}

// promoção de pontos ativa ou pontuação desligada (configuradas pelo admin)
function renderPromo(rules: GameRules | null): void {
  const box = document.getElementById('game-promo')!
  box.innerHTML = ''
  if (!rules) return
  let text = ''
  if (!rules.pointsEnabled) text = '⏸️ A pontuação por doação está pausada no momento.'
  else if (rules.promo) {
    const parts = []
    if (rules.promo.salvesMultiplier > 1) parts.push(`Salves x${rules.promo.salvesMultiplier}`)
    if (rules.promo.xpMultiplier > 1) parts.push(`XP x${rules.promo.xpMultiplier}`)
    const until = rules.promo.endsAt ? ` até ${rules.promo.endsAt.split('-').reverse().join('/')}` : ''
    text = `🎉 ${rules.promo.label || 'Promoção'}: ${parts.join(' e ') || 'pontos extras'} nas doações${until}!`
  }
  if (!text) return
  const p = document.createElement('p')
  p.className = 'mx-4 mt-3 rounded-2xl px-4 py-3 text-sm font-semibold bg-salvee-orange text-white'
  p.textContent = text
  box.appendChild(p)
}

async function loadList(): Promise<void> {
  const list = document.getElementById('game-list')!
  list.innerHTML = ''
  list.appendChild(Spinner())
  try {
    if (tab === 'available') {
      const rewards = await gamificationService.listRewards()
      list.innerHTML = ''
      if (!rewards.length) return empty(list, 'Nenhuma recompensa disponível no momento. Volte em breve!')
      rewards.forEach(r => list.appendChild(rewardCard(r)))
    } else {
      const mine = await gamificationService.listMyRewards()
      list.innerHTML = ''
      if (!mine.length) return empty(list, 'Você ainda não resgatou recompensas. Veja as disponíveis e troque seus Salves.')
      mine.forEach(m => list.appendChild(myRewardCard(m)))
    }
  } catch {
    list.innerHTML = ''
    empty(list, 'Não foi possível carregar as recompensas.')
  }
}

function empty(list: HTMLElement, text: string): void {
  const p = document.createElement('p')
  p.className = 'text-center text-gray-400 text-sm py-12'
  p.textContent = text
  list.appendChild(p)
}

function logo(url: string | null | undefined): HTMLElement {
  const box = document.createElement('div')
  box.className = 'w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0'
  if (url) {
    const img = document.createElement('img')
    img.src = url
    img.alt = ''
    img.className = 'w-full h-full object-cover'
    box.appendChild(img)
  } else {
    box.textContent = '🎁'
  }
  return box
}

const fmtDate = (ymd: string) => ymd.split('-').reverse().join('/')

// "Disponíveis" (spec 18.6): logo, parceiro, tipo, descrição, validade, custo, nível e ação
function rewardCard(r: Reward): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex gap-3'
  card.appendChild(logo(r.partnerLogoUrl))
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0 flex flex-col gap-0.5'
  const partner = document.createElement('p')
  partner.className = 'text-[0.6875rem] font-semibold text-salvee-orange uppercase tracking-wide'
  partner.textContent = [r.partnerName, r.rewardType].filter(Boolean).join(' · ') || 'Recompensa'
  const title = document.createElement('p')
  title.className = 'font-bold text-gray-900 text-sm'
  title.textContent = r.title
  info.append(partner, title)
  if (r.description) {
    const d = document.createElement('p')
    d.className = 'text-xs text-gray-500'
    d.textContent = r.description
    info.appendChild(d)
  }
  const meta = document.createElement('p')
  meta.className = 'text-[0.6875rem] text-gray-400'
  meta.textContent = [r.validUntil ? `Válida até ${fmtDate(r.validUntil)}` : '', r.minLevel ? `Nível ${r.minLevel}+` : ''].filter(Boolean).join(' · ')
  if (meta.textContent) info.appendChild(meta)

  const action = document.createElement('div')
  action.className = 'flex items-center justify-between gap-2 mt-2'
  const cost = document.createElement('span')
  cost.className = 'text-sm font-bold text-gray-900'
  cost.textContent = `${r.cost} Salves`
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = `px-4 py-1.5 rounded-full text-xs font-semibold ${r.canRedeem ? 'bg-salvee-orange text-white' : 'bg-gray-100 text-gray-400'}`
  btn.textContent = r.canRedeem ? 'Resgatar' : 'Indisponível'
  btn.disabled = !r.canRedeem
  action.append(cost, btn)
  info.appendChild(action)
  if (!r.canRedeem && r.reason) {
    const why = document.createElement('p')
    why.className = 'text-[0.6875rem] text-gray-400 text-right'
    why.textContent = r.reason
    info.appendChild(why)
  }
  // segundo toque confirma (os Salves são descontados na hora)
  btn.addEventListener('click', async () => {
    if (btn.dataset['confirm'] !== '1') {
      btn.dataset['confirm'] = '1'
      btn.textContent = `Confirmar (−${r.cost})`
      return
    }
    btn.disabled = true
    try {
      const mine = await gamificationService.redeemReward(r.id)
      showToast('Recompensa resgatada!', 'success')
      showRewardQr(mine)
      void loadTop()
      void loadList()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Não foi possível resgatar', 'error')
      btn.disabled = false
      btn.dataset['confirm'] = ''
      btn.textContent = 'Resgatar'
    }
  })
  card.appendChild(info)
  return card
}

const STATUS = {
  available: { label: 'Pronta para usar', className: 'bg-green-50 text-green-700' },
  used: { label: 'Usada', className: 'bg-gray-100 text-gray-500' },
  expired: { label: 'Vencida', className: 'bg-red-50 text-red-500' },
} as const

// "Minhas recompensas" (spec 18.7 e 18.10): tocar abre o QR Code
function myRewardCard(m: MyReward): HTMLElement {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = `w-full text-left bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 items-center ${m.status === 'available' ? '' : 'opacity-70'}`
  card.appendChild(logo(m.partnerLogoUrl))
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0'
  const title = document.createElement('p')
  title.className = 'font-bold text-gray-900 text-sm truncate'
  title.textContent = m.title
  const partner = document.createElement('p')
  partner.className = 'text-xs text-gray-500 truncate'
  partner.textContent = m.partnerName || '—'
  const meta = document.createElement('p')
  meta.className = 'text-[0.6875rem] text-gray-400'
  meta.textContent = m.status === 'used' && m.usedAt
    ? `Usada em ${new Date(m.usedAt).toLocaleDateString('pt-BR')}`
    : m.expiresAt ? `Válida até ${fmtDate(m.expiresAt)}` : `Resgatada em ${new Date(m.redeemedAt).toLocaleDateString('pt-BR')}`
  info.append(title, partner, meta)
  const badge = document.createElement('span')
  badge.className = `flex-shrink-0 text-[0.6875rem] font-semibold px-2 py-1 rounded-full ${STATUS[m.status].className}`
  badge.textContent = STATUS[m.status].label
  card.append(info, badge)
  card.addEventListener('click', () => showRewardQr(m))
  return card
}

export function unmount(): void {
  tab = 'available'
  document.getElementById('bottom-nav')?.remove()
}
