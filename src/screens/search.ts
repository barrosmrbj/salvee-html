// src/screens/search.ts
import { BottomNav, Spinner, showToast } from '@/components'
import { searchService } from '@/services'
import { request } from '@/services/api'
import type { Institution } from '@/types'

const MOCK_PROMOS = [
  { title: 'Promoções & metas do dia 5', subtitle: 'Doe hoje e ganhe o dobro de Salves', progress: 60, image: '/promos/promo-dia5.svg' },
  { title: 'Campanha de Inverno', subtitle: 'Agasalhos para famílias em vulnerabilidade', progress: 35, image: '/promos/promo-inverno.svg' },
  { title: 'Desafio 100 Doadores', subtitle: 'Juntos somos mais fortes!', progress: 82, image: '/promos/promo-100.svg' },
]

const DESTAQUES_FALLBACK = [
  { id: 'inst-lar-sao-jose',   name: 'Lar São José',     logoUrl: '/logos/lar-sao-jose.svg' },
  { id: 'inst-casa-esperanca', name: 'Casa Esperança',   logoUrl: '/logos/casa-esperanca.svg' },
  { id: 'inst-ong-raizes',     name: 'ONG Raízes',       logoUrl: '/logos/ong-raizes.svg' },
  { id: 'inst-proj-sementes',  name: 'Projeto Sementes', logoUrl: '/logos/proj-sementes.svg' },
  { id: 'inst-instituto-luz',  name: 'Instituto Luz',    logoUrl: '/logos/instituto-luz.svg' },
]

const MOCK_CAUSAS = [
  { id: 'c1', institutionId: 'inst3', category: 'Reforma', title: 'Reforma da Igreja', institution: 'ONG Verde', distance: '1,2 km' },
  { id: 'c2', institutionId: 'inst2', category: 'Saúde', title: 'Medicamentos para idosos', institution: 'Lar dos Idosos Felizes', distance: '2,5 km' },
  { id: 'c3', institutionId: 'inst1', category: 'Educação', title: 'Material escolar 2025', institution: 'Instituto Esperança', distance: '3,8 km' },
]

const FILTROS = ['Todos', 'Saúde', 'Crianças', 'Idosos', 'Educação', 'Animais']

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-30">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="search" placeholder="Procure uma instituição" class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-salvee-orange/30 transition-all" />
      </div>
    </header>

    <div class="flex-1 overflow-y-auto pb-24">
      <div id="search-results" class="hidden p-4 flex flex-col gap-3"></div>

      <div id="discovery-content">
        <!-- Promoções carousel -->
        <div class="px-4 pt-4">
          <div id="promo-track" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"></div>
          <div id="promo-dots" class="flex justify-center gap-1.5 mt-2"></div>
        </div>

        <!-- Destaques -->
        <div class="mt-5">
          <div class="flex items-center justify-between px-4 mb-3">
            <span class="text-base font-bold text-gray-900">Destaques</span>
            <button class="text-xs font-semibold text-salvee-orange">Veja todos</button>
          </div>
          <div id="destaques-list" class="flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide"></div>
        </div>

        <!-- Causas perto de você -->
        <div class="mt-5">
          <div class="flex items-center justify-between px-4 mb-3">
            <span class="text-base font-bold text-gray-900">Causas perto de você</span>
            <button id="filter-btn" class="flex items-center gap-1 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><polyline points="7 18 3 14 7 10"/></svg>
            </button>
          </div>
          <div id="filter-chips" class="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"></div>
          <div id="causas-list" class="flex flex-col gap-0 px-4"></div>
        </div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())

  buildPromos()
  buildDestaques()
  buildFilterChips()
  buildCausas(null)

  let searchTimeout: ReturnType<typeof setTimeout>
  document.getElementById('search-input')!.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    const q = (e.target as HTMLInputElement).value.trim()
    searchTimeout = setTimeout(() => performSearch(q), 400)
  })
}

function buildPromos(): void {
  const track = document.getElementById('promo-track')!
  const dots = document.getElementById('promo-dots')!

  MOCK_PROMOS.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm snap-start rounded-2xl overflow-hidden relative h-40'
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p class="text-white font-bold text-lg leading-tight">${p.title}</p>
        <p class="text-white/80 text-xs mt-0.5">${p.subtitle}</p>
        <div class="mt-2 h-1 rounded-full bg-white/30 overflow-hidden">
          <div class="h-full bg-salvee-orange rounded-full" style="width:${p.progress}%"></div>
        </div>
      </div>
    `
    track.appendChild(card)

    const dot = document.createElement('div')
    dot.className = `w-2 h-2 rounded-full transition-colors ${i === 0 ? 'bg-salvee-orange' : 'bg-gray-300'}`
    dot.dataset.index = String(i)
    dots.appendChild(dot)
  })

  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / track.clientWidth)
    dots.querySelectorAll('div').forEach((d, i) => {
      d.className = `w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-salvee-orange' : 'bg-gray-300'}`
    })
  })
}

function buildDestaques(): void {
  const list = document.getElementById('destaques-list')!

  request<Array<{ id: string; name: string; logoUrl: string | null }>>('/institutions/destaques')
    .then(insts => renderDestaques(list, insts.length ? insts : DESTAQUES_FALLBACK))
    .catch(() => renderDestaques(list, DESTAQUES_FALLBACK))
}

function renderDestaques(list: HTMLElement, insts: Array<{ id: string; name: string; logoUrl?: string | null }>): void {
  list.innerHTML = ''
  insts.forEach(inst => {
    const item = document.createElement('div')
    item.className = 'flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer'
    const logoHtml = inst.logoUrl
      ? `<img src="${inst.logoUrl}" alt="${inst.name}" class="w-full h-full object-cover" />`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    item.innerHTML = `
      <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
        ${logoHtml}
      </div>
      <span class="text-xs text-gray-700 text-center w-16 truncate">${inst.name}</span>
    `
    item.addEventListener('click', () => { window.location.hash = `/institution/${inst.id}` })
    list.appendChild(item)
  })
}

let activeFilter: string | null = null

function buildFilterChips(): void {
  const container = document.getElementById('filter-chips')!
  FILTROS.forEach(f => {
    const chip = document.createElement('button')
    chip.dataset.filter = f
    chip.className = `flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
      f === 'Todos' ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
    }`
    chip.textContent = f
    chip.addEventListener('click', () => {
      activeFilter = f === 'Todos' ? null : f
      container.querySelectorAll('button').forEach(b => {
        const active = b.dataset.filter === f
        b.className = `flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          active ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
        }`
      })
      buildCausas(activeFilter)
    })
    container.appendChild(chip)
  })
}

function buildCausas(filter: string | null): void {
  const list = document.getElementById('causas-list')!
  list.innerHTML = ''
  const filtered = filter ? MOCK_CAUSAS.filter(c => c.category === filter) : MOCK_CAUSAS

  if (filtered.length === 0) {
    list.innerHTML = '<p class="text-xs text-gray-400 py-4 text-center">Nenhuma causa nesta categoria.</p>'
    return
  }

  filtered.forEach(causa => {
    const item = document.createElement('div')
    item.className = 'flex items-center gap-3 bg-white rounded-xl p-3 mb-2 shadow-sm border border-gray-100 cursor-pointer'
    item.innerHTML = `
      <div class="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-5 4 5"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-xs text-salvee-orange font-semibold">${causa.category}</span>
        <p class="text-sm font-semibold text-gray-900 truncate">${causa.title}</p>
        <p class="text-xs text-gray-400 truncate">${causa.institution} · ${causa.distance}</p>
      </div>
      <button class="text-gray-300 flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
    `
    item.addEventListener('click', () => { window.location.hash = `/institution/${causa.institutionId}` })
    list.appendChild(item)
  })
}

async function performSearch(query: string): Promise<void> {
  const resultsEl = document.getElementById('search-results')!
  const discoveryEl = document.getElementById('discovery-content')!

  if (!query) { resultsEl.classList.add('hidden'); discoveryEl.classList.remove('hidden'); return }
  resultsEl.classList.remove('hidden')
  discoveryEl.classList.add('hidden')
  resultsEl.innerHTML = ''
  resultsEl.appendChild(Spinner())

  try {
    const results = await searchService.search(query)
    resultsEl.innerHTML = ''
    if (results.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'text-center text-gray-400 py-8'
      empty.textContent = 'Nenhum resultado encontrado.'
      resultsEl.appendChild(empty)
    } else {
      results.forEach(inst => resultsEl.appendChild(renderInstitutionCard(inst)))
    }
  } catch {
    resultsEl.innerHTML = ''
    showToast('Erro na busca', 'error')
  }
}

function renderInstitutionCard(inst: Institution): HTMLElement {
  const card = document.createElement('button')
  card.className = 'w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left hover:border-salvee-orange transition-colors'

  const logoDiv = document.createElement('div')
  logoDiv.className = 'w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400'
  if (inst.logoUrl) {
    const img = document.createElement('img')
    img.src = inst.logoUrl
    img.alt = inst.name
    img.className = 'w-full h-full object-cover'
    logoDiv.appendChild(img)
  } else {
    logoDiv.textContent = '🏢'
  }
  card.appendChild(logoDiv)

  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0'

  const nameRow = document.createElement('div')
  nameRow.className = 'flex items-center gap-1 mb-0.5'
  const nameSpan = document.createElement('span')
  nameSpan.className = 'font-semibold text-gray-900 text-sm truncate'
  nameSpan.textContent = inst.name
  nameRow.appendChild(nameSpan)

  if (inst.verified) {
    const badge = document.createElement('span')
    badge.className = 'inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0'
    badge.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    nameRow.appendChild(badge)
  }
  info.appendChild(nameRow)

  const catSpan = document.createElement('span')
  catSpan.className = 'text-xs text-gray-500'
  catSpan.textContent = inst.category
  info.appendChild(catSpan)
  card.appendChild(info)

  const chevron = document.createElement('div')
  chevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>'
  card.appendChild(chevron)

  card.addEventListener('click', () => { window.location.hash = `/institution/${inst.id}` })
  return card
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
