// src/screens/institution-profile.ts
import { Button, PostCard, ProgressBar, Spinner, showToast } from '@/components'
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
    const p = document.createElement('p')
    p.className = 'text-center text-gray-400 text-sm py-16 px-4'
    p.textContent = 'Não foi possível carregar esta instituição.'
    document.getElementById('profile-content')!.classList.remove('hidden')
    document.getElementById('profile-content')!.appendChild(p)
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

  // carrossel com as fotos da instituição, não as do mural (spec 13.3 e 13.4)
  hero.appendChild(photoCarousel(inst))

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
  if (inst.status === 'approved') nameSection.appendChild(followRow(inst))
  content.appendChild(nameSection)
  if (inst.activeCampaign) content.appendChild(campaignGoal(inst.activeCampaign))

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

// Seguir (spec 23.1): as publicações dela aparecem na aba "Seguindo" do feed
function followRow(inst: Institution): HTMLElement {
  const row = document.createElement('div')
  row.className = 'flex items-center gap-3 mt-3'
  let following = Boolean(inst.following)
  let count = inst.followersCount ?? 0
  const btn = document.createElement('button')
  btn.type = 'button'
  const counter = document.createElement('span')
  counter.className = 'text-xs text-gray-500'
  const paint = () => {
    btn.className = following
      ? 'px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 bg-white'
      : 'px-4 py-1.5 rounded-full text-sm font-semibold bg-salvee-orange text-white'
    btn.textContent = following ? '✓ Seguindo' : 'Seguir'
    counter.textContent = `${count} ${count === 1 ? 'seguidor' : 'seguidores'}`
  }
  paint()
  btn.addEventListener('click', async () => {
    btn.disabled = true
    try {
      const r = following ? await institutionService.unfollow(inst.id) : await institutionService.follow(inst.id)
      following = r.following
      count = r.followersCount
      paint()
      if (following) showToast('Você segue esta instituição. As publicações dela aparecem em "Seguindo" no feed.', 'success', 3500)
    } catch {
      showToast('Não foi possível atualizar agora', 'error')
    } finally {
      btn.disabled = false
    }
  })
  row.append(btn, counter)
  return row
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
    renderInfo(inst, tabContent)
  }
}

function photoCarousel(inst: Institution): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'relative h-48 bg-salvee-orange-bg'
  if (!inst.photos.length) {
    wrap.className += ' flex items-center justify-center text-6xl'
    wrap.textContent = '🏢'
    return wrap
  }
  const track = document.createElement('div')
  track.className = 'flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide'
  inst.photos.forEach(src => {
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.className = 'w-full h-full object-cover flex-shrink-0 snap-center'
    track.appendChild(img)
  })
  wrap.appendChild(track)
  if (inst.photos.length > 1) {
    const dots = document.createElement('div')
    dots.className = 'absolute bottom-2 right-3 flex gap-1.5'
    const paint = (active: number) => dots.querySelectorAll('span').forEach((d, i) => {
      d.className = `w-2 h-2 rounded-full ${i === active ? 'bg-white' : 'bg-white/50'}`
    })
    inst.photos.forEach(() => dots.appendChild(document.createElement('span')))
    paint(0)
    track.addEventListener('scroll', () => paint(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))))
    wrap.appendChild(dots)
  }
  return wrap
}

// barra da meta ativa (spec 13.6): aqui sempre campanha específica (meta mensal ainda não existe)
function campaignGoal(c: NonNullable<Institution['activeCampaign']>): HTMLElement {
  const box = document.createElement('button')
  box.type = 'button'
  box.className = 'mx-4 mb-4 w-[calc(100%-2rem)] text-left bg-salvee-orange-bg rounded-2xl p-4 flex flex-col gap-2'
  const head = document.createElement('div')
  head.className = 'flex items-center justify-between gap-2'
  const label = document.createElement('span')
  label.className = 'text-[0.6875rem] font-semibold text-salvee-orange uppercase tracking-wide'
  label.textContent = '🎯 Campanha ativa'
  const more = document.createElement('span')
  more.className = 'text-xs font-semibold text-salvee-orange'
  more.textContent = 'Ver campanha ›'
  head.append(label, more)
  const title = document.createElement('p')
  title.className = 'font-bold text-gray-900 text-sm'
  title.textContent = c.title
  box.append(head, title, ProgressBar(c.current, c.goal))
  box.addEventListener('click', () => { window.location.hash = `/campanha/${c.id}` })
  return box
}

// aba Info (spec 13.10): dados práticos, discador, e-mail, mapa e rota
function renderInfo(inst: Institution, tabContent: HTMLElement): void {
  const list = document.createElement('div')
  list.className = 'flex flex-col gap-3 text-sm'
  const addRow = (icon: string, label: string, value: string, href?: string) => {
    const row = document.createElement(href ? 'a' : 'div') as HTMLElement
    if (href) (row as HTMLAnchorElement).href = href
    row.className = 'flex items-start gap-3 p-3 bg-gray-50 rounded-xl'
    const i = document.createElement('span')
    i.className = 'text-xl'
    i.textContent = icon
    const d = document.createElement('div')
    d.className = 'min-w-0'
    const l = document.createElement('p')
    l.className = 'font-medium text-gray-900'
    l.textContent = label
    const v = document.createElement('p')
    v.className = `${href ? 'text-salvee-orange' : 'text-gray-500'} break-words`
    v.textContent = value
    d.append(l, v)
    row.append(i, d)
    list.appendChild(row)
  }

  addRow('🏢', 'Instituição', inst.category ? `${inst.name} · ${inst.category}` : inst.name)
  const a = inst.address
  const street = a?.street || ''
  const cityState = [inst.city || a?.city, inst.state || a?.state].filter(Boolean).join(' - ')
  const fullAddress = [street, cityState, a?.zipCode ? `CEP ${a.zipCode}` : ''].filter(Boolean).join(', ')
  if (fullAddress) addRow('📍', 'Endereço', fullAddress)
  if (inst.openingHours) addRow('🕒', 'Dias e horários', inst.openingHours)
  if (inst.phone) addRow('📞', 'Telefone', inst.phone, `tel:${inst.phone.replace(/[^\d+]/g, '')}`)
  if (inst.email) addRow('✉️', 'E-mail', inst.email, `mailto:${inst.email}`)
  if (inst.cnpj) addRow('📄', 'CNPJ', inst.cnpj)
  tabContent.appendChild(list)

  // mapa com marcação + rota (spec 13.10): sem chave de API, pelo endereço
  // ponto marcado no cadastro é mais preciso que o endereço
  const hasCoords = inst.latitude != null && inst.longitude != null
  const mapQuery = hasCoords ? `${inst.latitude},${inst.longitude}` : [street, cityState, a?.zipCode].filter(Boolean).join(', ')
  if (mapQuery) {
    const q = encodeURIComponent(mapQuery)
    const map = document.createElement('iframe')
    map.title = 'Mapa da instituição'
    map.loading = 'lazy'
    map.referrerPolicy = 'no-referrer-when-downgrade'
    map.className = 'w-full h-56 rounded-xl border-0 mt-3 bg-gray-100'
    map.src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`
    tabContent.appendChild(map)

    const routes = document.createElement('div')
    routes.className = 'grid grid-cols-2 gap-2 mt-3'
    const routeBtn = (label: string, href: string) => {
      const link = document.createElement('a')
      link.href = href
      link.target = '_blank'
      link.rel = 'noopener'
      link.className = 'py-2.5 rounded-xl border border-gray-200 text-center text-sm font-semibold text-gray-700 bg-white'
      link.textContent = label
      routes.appendChild(link)
    }
    routeBtn('🗺️ Google Maps', `https://www.google.com/maps/dir/?api=1&destination=${q}`)
    routeBtn('🚗 Waze', hasCoords ? `https://waze.com/ul?ll=${q}&navigate=yes` : `https://waze.com/ul?q=${q}&navigate=yes`)
    tabContent.appendChild(routes)
  }
}

export function unmount(): void {
  activeTab = 'mural'
}
