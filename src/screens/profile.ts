// src/screens/profile.ts
import { BottomNav, Avatar, Spinner, showToast, Button } from '@/components'
import { userService, gamificationService, donationService, institutionService } from '@/services'
import type { User, GameBalance, Reward, Donation, Institution, MyInstitution } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
      <h1 class="text-xl font-bold text-gray-900">Perfil</h1>
      <button id="settings-btn" class="text-gray-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
    </header>
    <div id="profile-loading" class="flex justify-center py-16"></div>
    <div id="profile-content" class="hidden pb-24"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  document.getElementById('settings-btn')!.addEventListener('click', () => { window.location.hash = '/settings' })

  const loadingEl = document.getElementById('profile-loading')!
  loadingEl.appendChild(Spinner())

  Promise.all([
    userService.getProfile().catch(() => getMockUser()),
    gamificationService.getBalance().catch(() => getMockBalance()),
    gamificationService.listRewards().catch(() => getMockRewards()),
    donationService.getHistory().catch(() => getMockDonations()),
    institutionService.list().catch(() => []),
  ]).then(([user, balance, rewards, donations, institutions]) => {
    loadingEl.remove()
    renderProfile(user, balance, rewards, donations as Donation[], institutions as Institution[])
  })
}

function renderProfile(user: User, balance: GameBalance, rewards: Reward[], donations: Donation[], institutions: Institution[]): void {
  const content = document.getElementById('profile-content')!
  content.classList.remove('hidden')

  const xpPct = Math.min((balance.xp / (balance.xp + balance.xpToNextLevel)) * 100, 100)

  // Hero card
  const hero = document.createElement('div')
  hero.className = 'bg-white p-6 flex flex-col items-center gap-3 border-b border-gray-100'

  const avatarContainer = document.createElement('div')
  avatarContainer.appendChild(Avatar(user.name, user.avatarUrl, 'lg'))
  hero.appendChild(avatarContainer)

  const nameBlock = document.createElement('div')
  nameBlock.className = 'text-center'
  const nameH2 = document.createElement('h2')
  nameH2.className = 'text-xl font-bold text-gray-900'
  nameH2.textContent = user.name
  const levelP = document.createElement('p')
  levelP.className = 'text-sm text-salvee-orange font-medium'
  levelP.textContent = `Nível ${balance.level}${balance.levelName ? ` · ${balance.levelName}` : ''}`
  nameBlock.appendChild(nameH2)
  nameBlock.appendChild(levelP)
  hero.appendChild(nameBlock)

  // XP progress bar
  const xpSection = document.createElement('div')
  xpSection.className = 'w-full'
  const xpLabels = document.createElement('div')
  xpLabels.className = 'flex justify-between text-xs text-gray-400 mb-1'
  const xpLeft = document.createElement('span')
  xpLeft.textContent = `${balance.xp} XP`
  const xpRight = document.createElement('span')
  xpRight.textContent = `Próximo nível: ${balance.xp + balance.xpToNextLevel} XP`
  xpLabels.appendChild(xpLeft)
  xpLabels.appendChild(xpRight)
  const barBg = document.createElement('div')
  barBg.className = 'w-full bg-gray-100 rounded-full h-2'
  const barFill = document.createElement('div')
  barFill.className = 'bg-salvee-orange h-2 rounded-full transition-all'
  barFill.style.width = `${xpPct}%`
  barBg.appendChild(barFill)
  xpSection.appendChild(xpLabels)
  xpSection.appendChild(barBg)
  hero.appendChild(xpSection)

  // Stats row
  const statsRow = document.createElement('div')
  statsRow.className = 'flex gap-4 w-full mt-2'

  const addStat = (value: number, label: string) => {
    const card = document.createElement('div')
    card.className = 'flex-1 bg-salvee-orange-bg rounded-2xl p-4 text-center'
    const valP = document.createElement('p')
    valP.className = 'text-2xl font-bold text-salvee-orange'
    valP.textContent = String(value)
    const labelP = document.createElement('p')
    labelP.className = 'text-xs text-gray-500 mt-0.5'
    labelP.textContent = label
    card.appendChild(valP)
    card.appendChild(labelP)
    statsRow.appendChild(card)
  }

  addStat(balance.xp, 'XP Total')
  addStat(balance.salves, 'Salves')
  hero.appendChild(statsRow)
  content.appendChild(hero)

  // situação do cadastro de instituição (só para quem cadastrou alguma)
  const instStatus = document.createElement('div')
  content.appendChild(instStatus)
  institutionService.listMine()
    .then(mine => { if (mine.length) instStatus.appendChild(institutionStatusCard(mine)) })
    .catch(() => {})

  // Tabs
  const tabBar = document.createElement('div')
  tabBar.className = 'flex border-b border-gray-100 bg-white'

  const activeTabClass = 'flex-1 py-3 text-xs font-semibold text-salvee-orange border-b-2 border-salvee-orange'
  const inactiveTabClass = 'flex-1 py-3 text-xs font-medium text-gray-400 border-b-2 border-transparent'

  const tabAvailable = document.createElement('button')
  tabAvailable.className = activeTabClass
  tabAvailable.textContent = 'Recompensas'
  const tabMy = document.createElement('button')
  tabMy.className = inactiveTabClass
  tabMy.textContent = 'Resgatadas'
  const tabHistory = document.createElement('button')
  tabHistory.className = inactiveTabClass
  tabHistory.textContent = 'Histórico'

  tabBar.appendChild(tabAvailable)
  tabBar.appendChild(tabMy)
  tabBar.appendChild(tabHistory)
  content.appendChild(tabBar)

  const tabContent = document.createElement('div')
  tabContent.id = 'tab-content'
  tabContent.className = 'grid grid-cols-1 gap-3 p-4'
  content.appendChild(tabContent)

  const setActive = (active: HTMLButtonElement) => {
    ;[tabAvailable, tabMy, tabHistory].forEach(t => {
      t.className = t === active ? activeTabClass : inactiveTabClass
    })
  }

  tabAvailable.addEventListener('click', () => {
    setActive(tabAvailable)
    tabContent.className = 'grid grid-cols-1 gap-3 p-4'
    renderRewardsList(rewards)
  })
  tabMy.addEventListener('click', () => {
    setActive(tabMy)
    tabContent.className = 'grid grid-cols-1 gap-3 p-4'
    tabContent.innerHTML = '<p class="text-center text-gray-400 py-8 col-span-full">Nenhuma recompensa resgatada.</p>'
  })
  tabHistory.addEventListener('click', () => {
    setActive(tabHistory)
    tabContent.className = 'flex flex-col gap-3 p-4'
    renderDonationHistory(donations, institutions)
  })

  renderRewardsList(rewards)
}

function renderRewardsList(rewards: Reward[]): void {
  const grid = document.getElementById('tab-content')!
  grid.innerHTML = ''
  rewards.forEach(reward => {
    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4'

    const logoDiv = document.createElement('div')
    logoDiv.className = 'w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0'
    if (reward.partnerLogoUrl) {
      const img = document.createElement('img')
      img.src = reward.partnerLogoUrl
      img.alt = reward.partnerName ?? ''
      img.className = 'w-full h-full object-cover'
      logoDiv.appendChild(img)
    } else {
      logoDiv.textContent = '🎁'
    }
    card.appendChild(logoDiv)

    const info = document.createElement('div')
    info.className = 'flex-1 min-w-0'
    const titleP = document.createElement('p')
    titleP.className = 'font-semibold text-gray-900 text-sm'
    titleP.textContent = reward.title
    info.appendChild(titleP)
    if (reward.partnerName) {
      const partnerP = document.createElement('p')
      partnerP.className = 'text-xs text-gray-500'
      partnerP.textContent = reward.partnerName
      info.appendChild(partnerP)
    }
    const descP = document.createElement('p')
    descP.className = 'text-xs text-gray-400 mt-0.5'
    descP.textContent = reward.description
    info.appendChild(descP)
    card.appendChild(info)

    const btnContainer = document.createElement('div')
    btnContainer.className = 'flex-shrink-0'
    btnContainer.appendChild(Button({
      label: `${reward.cost} SLV`,
      variant: 'primary',
      onClick: async () => {
        try {
          await gamificationService.redeemReward(reward.id)
          showToast('Recompensa resgatada! Verifique seu QR Code.', 'success')
        } catch {
          showToast('Salves insuficientes', 'error')
        }
      },
    }))
    card.appendChild(btnContainer)
    grid.appendChild(card)
  })
}

function renderDonationHistory(donations: Donation[], _institutions: Institution[]): void {
  const container = document.getElementById('tab-content')!
  container.innerHTML = ''

  if (donations.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhuma doação ainda.</p>'
    return
  }

  // o resumo conta só as confirmadas: pendentes ainda não creditaram pontos
  const confirmed = donations.filter(d => (d.status ?? 'confirmed') === 'confirmed')
  const totalDonated = confirmed.reduce((s, d) => s + (d.amount ?? 0), 0)
  const totalXp = confirmed.reduce((s, d) => s + (d.xpEarned ?? 0), 0)
  const totalSalves = confirmed.reduce((s, d) => s + (d.salvesEarned ?? 0), 0)

  const summary = document.createElement('div')
  summary.className = 'bg-salvee-orange rounded-2xl p-4 text-white'
  summary.innerHTML = `
    <p class="text-xs font-medium text-white/70 mb-3">Resumo de doações</p>
    <div class="flex justify-between">
      <div class="text-center">
        <p class="text-xl font-bold">R$&nbsp;${totalDonated.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
        <p class="text-xs text-white/70 mt-0.5">Total doado</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-bold">+${totalXp}</p>
        <p class="text-xs text-white/70 mt-0.5">XP ganho</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-bold">+${totalSalves}</p>
        <p class="text-xs text-white/70 mt-0.5">Salves ganhos</p>
      </div>
    </div>
  `
  container.appendChild(summary)

  const payIcon: Record<string, string> = { pix: '⚡', paypal: '🅿️', google_pay: 'G', apple_pay: '🍎', card: '💳' }

  donations.forEach(d => {
    const logoUrl = (d as any).institutionLogoUrl as string | null
    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3'

    const logoDiv = document.createElement('div')
    logoDiv.className = 'w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 text-xl'
    if (logoUrl) {
      const img = document.createElement('img')
      img.src = logoUrl
      img.alt = d.institutionName
      img.className = 'w-full h-full object-cover'
      logoDiv.appendChild(img)
    } else {
      logoDiv.textContent = '🏢'
    }
    card.appendChild(logoDiv)

    const info = document.createElement('div')
    info.className = 'flex-1 min-w-0'
    const nameP = document.createElement('p')
    nameP.className = 'font-semibold text-gray-900 text-sm truncate'
    nameP.textContent = d.institutionName ?? 'Instituição'
    const metaP = document.createElement('p')
    metaP.className = 'text-xs text-gray-400 mt-0.5'
    metaP.textContent = `${payIcon[d.paymentMethod ?? 'pix'] ?? '⚡'} ${(d.paymentMethod ?? 'pix').toUpperCase()} · ${new Date(d.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    const pointsP = document.createElement('p')
    pointsP.className = 'text-xs text-salvee-orange font-medium mt-1'
    const status = d.status ?? 'confirmed'
    if (status === 'confirmed') {
      pointsP.textContent = `+${d.xpEarned ?? 0} XP · +${d.salvesEarned ?? 0} SLV`
    } else if (status === 'pending') {
      pointsP.className = 'text-xs text-amber-600 font-medium mt-1'
      pointsP.textContent = `Aguardando confirmação · +${d.xpEarned ?? 0} XP · +${d.salvesEarned ?? 0} SLV`
    } else {
      pointsP.className = 'text-xs text-gray-400 font-medium mt-1'
      pointsP.textContent = 'Cancelada'
    }
    info.appendChild(nameP)
    info.appendChild(metaP)
    info.appendChild(pointsP)
    card.appendChild(info)

    const amountP = document.createElement('p')
    amountP.className = 'font-bold text-gray-900 text-base flex-shrink-0'
    amountP.textContent = `R$ ${(d.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    card.appendChild(amountP)

    container.appendChild(card)
  })
}

function getMockDonations(): Donation[] {
  return [
    { id: 'd1', institutionId: 'inst-lar-sao-jose', institutionName: 'Lar São José', amount: 50, paymentMethod: 'pix', anonymous: false, xpEarned: 25, salvesEarned: 12, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'd2', institutionId: 'inst-casa-esperanca', institutionName: 'Casa Esperança', amount: 100, paymentMethod: 'pix', anonymous: false, xpEarned: 50, salvesEarned: 25, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'd3', institutionId: 'inst-ong-raizes', institutionName: 'ONG Raízes', amount: 30, paymentMethod: 'pix', anonymous: false, xpEarned: 15, salvesEarned: 7, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  ]
}

// Cartão "Minha instituição" no perfil: situação de cada cadastro (em análise, aprovado...).
// Tocar leva à tela completa (#/institution-status), com o que corrigir e as ações.
const INSTITUTION_STATUS: Record<MyInstitution['status'], { label: string; text: string; className: string; icon: string }> = {
  draft: { icon: '📝', label: 'NÃO ENVIADO', text: 'Seu cadastro de instituição ainda não foi enviado para análise.', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  pending: { icon: '⏳', label: 'EM ANÁLISE', text: 'Seu cadastro de instituição está em análise.', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { icon: '✅', label: 'APROVADO', text: 'Seu cadastro de instituição está aprovado.', className: 'bg-green-50 text-green-700 border-green-200' },
  needs_revision: { icon: '✏️', label: 'CORREÇÃO NECESSÁRIA', text: 'Seu cadastro de instituição precisa de correções.', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected: { icon: '❌', label: 'NÃO APROVADO', text: 'Seu cadastro de instituição não foi aprovado.', className: 'bg-red-50 text-red-600 border-red-200' },
}

function institutionStatusCard(mine: MyInstitution[]): HTMLElement {
  const section = document.createElement('div')
  section.className = 'bg-white border-b border-gray-100 px-4 py-4 flex flex-col gap-3'
  const title = document.createElement('p')
  title.className = 'text-xs font-semibold text-gray-400 uppercase tracking-wider'
  title.textContent = mine.length > 1 ? 'Minhas instituições' : 'Minha instituição'
  section.appendChild(title)

  mine.forEach(inst => {
    const s = INSTITUTION_STATUS[inst.status]
    const row = document.createElement('button')
    row.type = 'button'
    row.className = `w-full text-left rounded-2xl border px-4 py-3 flex items-center gap-3 ${s.className}`
    const icon = document.createElement('span')
    icon.className = 'text-2xl flex-shrink-0'
    icon.textContent = s.icon
    const info = document.createElement('div')
    info.className = 'flex-1 min-w-0'
    const name = document.createElement('p')
    name.className = 'font-semibold text-gray-900 text-sm truncate'
    name.textContent = inst.name
    const text = document.createElement('p')
    text.className = 'text-xs mt-0.5'
    text.textContent = s.text
    info.append(name, text)
    const badge = document.createElement('span')
    badge.className = 'text-[0.625rem] font-bold tracking-wide flex-shrink-0'
    badge.textContent = s.label
    row.append(icon, info, badge)
    row.addEventListener('click', () => { window.location.hash = '/institution-status' })
    section.appendChild(row)
  })
  return section
}

function getMockUser(): User {
  return { id: '1', name: 'José Felipe Amorim', email: 'jose@email.com', xp: 350, salves: 500, level: 5, createdAt: '' }
}

function getMockBalance(): GameBalance {
  return { xp: 350, salves: 500, level: 5, xpToNextLevel: 150, levelName: 'Voluntário' }
}

function getMockRewards(): Reward[] {
  return [
    { id: 'r1', title: 'Xbox Gamepass', description: '3 Meses Ultimate', cost: 250, partnerName: 'Xbox' },
    { id: 'r2', title: 'Café Grátis', description: '1 café expresso', cost: 50, partnerName: 'Café Local' },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
