// src/screens/institution-profile.ts
import { Button, PostCard, Spinner } from '@/components'
import { feedService, institutionService } from '@/services'
import type { Institution } from '@/types'

type Tab = 'mural' | 'sobre' | 'info'
let activeTab: Tab = 'mural'

export function render(params?: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.dataset['institutionId'] = params?.id ?? ''
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
    </div>
    <div id="profile-loading" class="flex justify-center py-16"></div>
    <div id="profile-content" class="hidden flex-1 overflow-y-auto pb-24"></div>
    <div id="profile-footer" class="hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-4 bg-white border-t border-gray-100 pb-safe"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const el = document.querySelector('[data-institution-id]') as HTMLElement
  const id = el?.dataset['institutionId'] ?? ''

  const loadingEl = document.getElementById('profile-loading')!
  loadingEl.appendChild(Spinner())

  institutionService.getById(id).then(renderProfile).catch(() => {
    loadingEl.remove()
    renderProfile(getMockInstitution(id))
  })
}

function renderProfile(inst: Institution): void {
  const loadingEl = document.getElementById('profile-loading')
  if (loadingEl) loadingEl.remove()
  const content = document.getElementById('profile-content')!
  const footer = document.getElementById('profile-footer')!
  content.classList.remove('hidden')
  footer.classList.remove('hidden')

  // Hero section
  const hero = document.createElement('div')
  hero.className = 'relative'

  const heroBg = document.createElement('div')
  heroBg.className = 'h-40 bg-salvee-orange-bg flex items-center justify-center overflow-hidden'
  if (inst.photos[0]) {
    const img = document.createElement('img')
    img.src = inst.photos[0]
    img.alt = ''
    img.className = 'w-full h-full object-cover'
    heroBg.appendChild(img)
  } else {
    heroBg.textContent = '🏢'
    heroBg.style.fontSize = '3.75rem'
  }
  hero.appendChild(heroBg)

  const logoWrapper = document.createElement('div')
  logoWrapper.className = 'absolute -bottom-6 left-4 w-16 h-16 rounded-2xl bg-white shadow-md overflow-hidden flex items-center justify-center border border-gray-100'
  if (inst.logoUrl) {
    const logoImg = document.createElement('img')
    logoImg.src = inst.logoUrl
    logoImg.alt = inst.name
    logoImg.className = 'w-full h-full object-cover'
    logoWrapper.appendChild(logoImg)
  } else {
    logoWrapper.textContent = '🏢'
    logoWrapper.style.fontSize = '1.5rem'
  }
  hero.appendChild(logoWrapper)
  content.appendChild(hero)

  // Name section
  const nameSection = document.createElement('div')
  nameSection.className = 'px-4 pt-10 pb-4'

  const nameRow = document.createElement('div')
  nameRow.className = 'flex items-center gap-2 mb-1'
  const nameH1 = document.createElement('h1')
  nameH1.className = 'text-xl font-bold text-gray-900'
  nameH1.textContent = inst.name
  nameRow.appendChild(nameH1)

  if (inst.verified) {
    const badge = document.createElement('span')
    badge.className = 'inline-flex items-center justify-center w-5 h-5 bg-salvee-orange rounded-full'
    badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    nameRow.appendChild(badge)
  }
  nameSection.appendChild(nameRow)

  const catSpan = document.createElement('span')
  catSpan.className = 'text-sm text-gray-500'
  catSpan.textContent = inst.category
  nameSection.appendChild(catSpan)
  content.appendChild(nameSection)

  // Tabs
  const tabs = ['mural', 'sobre', 'info'] as Tab[]
  const tabBar = document.createElement('div')
  tabBar.className = 'flex border-b border-gray-100 px-4'

  tabs.forEach(t => {
    const btn = document.createElement('button')
    const isActive = activeTab === t
    btn.className = `flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${isActive ? 'border-salvee-orange text-salvee-orange' : 'border-transparent text-gray-400'}`
    btn.textContent = t.charAt(0).toUpperCase() + t.slice(1)
    btn.dataset['tab'] = t
    btn.addEventListener('click', () => {
      activeTab = t
      tabBar.querySelectorAll('[data-tab]').forEach(b => {
        const isNowActive = (b as HTMLElement).dataset['tab'] === activeTab
        b.className = `flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${isNowActive ? 'border-salvee-orange text-salvee-orange' : 'border-transparent text-gray-400'}`
      })
      renderTab(inst, tabContent)
    })
    tabBar.appendChild(btn)
  })
  content.appendChild(tabBar)

  const tabContent = document.createElement('div')
  tabContent.id = 'tab-content'
  tabContent.className = 'p-4'
  content.appendChild(tabContent)

  renderTab(inst, tabContent)

  footer.appendChild(Button({
    label: 'Ajudar',
    variant: 'primary',
    fullWidth: true,
    onClick: () => { window.location.hash = `/donate/${inst.id}` },
  }))
}

function renderTab(inst: Institution, tabContent: HTMLElement): void {
  tabContent.innerHTML = ''

  if (activeTab === 'mural') {
    // as mesmas publicações do feed, só desta instituição (spec 13.8)
    const empty = (text: string) => {
      const p = document.createElement('p')
      p.className = 'text-center text-gray-400 py-8 text-sm'
      p.textContent = text
      tabContent.appendChild(p)
    }
    const list = document.createElement('div')
    list.className = 'flex flex-col gap-4'
    const loading = document.createElement('div')
    loading.className = 'flex justify-center py-8'
    loading.appendChild(Spinner())
    tabContent.append(loading, list)
    feedService.listPosts(1, inst.id).then(posts => {
      loading.remove()
      if (activeTab !== 'mural') return
      if (!posts.length) return empty('Nenhuma postagem ainda.')
      posts.forEach(p => list.appendChild(PostCard(p, {
        onDeleted: () => { if (!list.children.length) empty('Nenhuma postagem ainda.') },
      })))
    }).catch(() => {
      loading.remove()
      empty('Não foi possível carregar as publicações.')
    })
  } else if (activeTab === 'sobre') {
    if (inst.mission) {
      const section = document.createElement('div')
      section.className = 'mb-4'
      const h3 = document.createElement('h3')
      h3.className = 'font-semibold text-gray-900 mb-1'
      h3.textContent = 'Missão'
      const p = document.createElement('p')
      p.className = 'text-sm text-gray-600 leading-relaxed'
      p.textContent = inst.mission
      section.appendChild(h3)
      section.appendChild(p)
      tabContent.appendChild(section)
    }
    if (inst.history) {
      const section = document.createElement('div')
      section.className = 'mb-4'
      const h3 = document.createElement('h3')
      h3.className = 'font-semibold text-gray-900 mb-1'
      h3.textContent = 'História'
      const p = document.createElement('p')
      p.className = 'text-sm text-gray-600 leading-relaxed'
      p.textContent = inst.history
      section.appendChild(h3)
      section.appendChild(p)
      tabContent.appendChild(section)
    }
    if (inst.foundedYear) {
      const p = document.createElement('p')
      p.className = 'text-sm text-gray-500'
      p.textContent = `Fundada em ${inst.foundedYear}`
      tabContent.appendChild(p)
    }
    if (!inst.mission && !inst.history) {
      const p = document.createElement('p')
      p.className = 'text-center text-gray-400 py-8 text-sm'
      p.textContent = 'Sem informações disponíveis.'
      tabContent.appendChild(p)
    }
  } else {
    const hasInfo = inst.address || inst.cnpj || inst.phone
    if (!hasInfo) {
      const p = document.createElement('p')
      p.className = 'text-center text-gray-400 py-8'
      p.textContent = 'Sem informações de contato.'
      tabContent.appendChild(p)
      return
    }
    const infoList = document.createElement('div')
    infoList.className = 'flex flex-col gap-3 text-sm'

    if (inst.address) {
      const row = document.createElement('div')
      row.className = 'flex items-start gap-3 p-3 bg-gray-50 rounded-xl'
      const icon = document.createElement('span')
      icon.textContent = '📍'
      icon.className = 'text-xl'
      const details = document.createElement('div')
      const label = document.createElement('p')
      label.className = 'font-medium text-gray-900'
      label.textContent = 'Endereço'
      const val = document.createElement('p')
      val.className = 'text-gray-500'
      val.textContent = `${inst.address.street}, ${inst.address.city} - ${inst.address.state}`
      details.appendChild(label)
      details.appendChild(val)
      row.appendChild(icon)
      row.appendChild(details)
      infoList.appendChild(row)
    }

    if (inst.cnpj) {
      const row = document.createElement('div')
      row.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded-xl'
      const icon = document.createElement('span')
      icon.textContent = '📄'
      icon.className = 'text-xl'
      const details = document.createElement('div')
      const label = document.createElement('p')
      label.className = 'font-medium text-gray-900'
      label.textContent = 'CNPJ'
      const val = document.createElement('p')
      val.className = 'text-gray-500'
      val.textContent = inst.cnpj
      details.appendChild(label)
      details.appendChild(val)
      row.appendChild(icon)
      row.appendChild(details)
      infoList.appendChild(row)
    }

    if (inst.phone) {
      const link = document.createElement('a')
      link.href = `tel:${inst.phone}`
      link.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded-xl'
      const icon = document.createElement('span')
      icon.textContent = '📞'
      icon.className = 'text-xl'
      const details = document.createElement('div')
      const label = document.createElement('p')
      label.className = 'font-medium text-gray-900'
      label.textContent = 'Telefone'
      const val = document.createElement('p')
      val.className = 'text-salvee-orange'
      val.textContent = inst.phone
      details.appendChild(label)
      details.appendChild(val)
      link.appendChild(icon)
      link.appendChild(details)
      infoList.appendChild(link)
    }

    tabContent.appendChild(infoList)
  }
}

function getMockInstitution(id: string): Institution {
  return {
    id,
    name: 'Instituto Esperança',
    category: 'Crianças',
    verified: true,
    status: 'approved',
    description: 'Trabalhamos para transformar a vida de crianças em situação de vulnerabilidade.',
    photos: [],
    mission: 'Garantir um futuro melhor para crianças carentes.',
    history: 'Fundada em 2010 por um grupo de voluntários apaixonados pela causa.',
    foundedYear: 2010,
    phone: '(92) 99999-9999',
    cnpj: '00.000.000/0000-00',
  }
}

export function unmount(): void {
  activeTab = 'mural'
}
