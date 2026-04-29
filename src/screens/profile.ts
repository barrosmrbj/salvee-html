// src/screens/profile.ts
import { BottomNav, Avatar, Spinner, showToast, Button } from '@/components'
import { userService, gamificationService } from '@/services'
import type { User, GameBalance, Reward } from '@/types'

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
  ]).then(([user, balance, rewards]) => {
    loadingEl.remove()
    renderProfile(user, balance, rewards)
  })
}

function renderProfile(user: User, balance: GameBalance, rewards: Reward[]): void {
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

  // Tabs
  const tabBar = document.createElement('div')
  tabBar.className = 'flex border-b border-gray-100 bg-white'
  const tabAvailable = document.createElement('button')
  tabAvailable.id = 'tab-available'
  tabAvailable.className = 'flex-1 py-3 text-sm font-medium text-salvee-orange border-b-2 border-salvee-orange'
  tabAvailable.textContent = 'Disponível'
  const tabMy = document.createElement('button')
  tabMy.id = 'tab-rewards'
  tabMy.className = 'flex-1 py-3 text-sm font-medium text-gray-400 border-b-2 border-transparent'
  tabMy.textContent = 'Minhas recompensas'
  tabBar.appendChild(tabAvailable)
  tabBar.appendChild(tabMy)
  content.appendChild(tabBar)

  const rewardsGrid = document.createElement('div')
  rewardsGrid.id = 'rewards-grid'
  rewardsGrid.className = 'grid grid-cols-1 gap-3 p-4'
  content.appendChild(rewardsGrid)

  tabAvailable.addEventListener('click', () => renderRewardsList(rewards))
  tabMy.addEventListener('click', () => {
    const empty = document.createElement('p')
    empty.className = 'text-center text-gray-400 py-8 col-span-full'
    empty.textContent = 'Nenhuma recompensa resgatada.'
    rewardsGrid.innerHTML = ''
    rewardsGrid.appendChild(empty)
  })

  renderRewardsList(rewards)
}

function renderRewardsList(rewards: Reward[]): void {
  const grid = document.getElementById('rewards-grid')!
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
