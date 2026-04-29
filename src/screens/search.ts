// src/screens/search.ts
import { BottomNav, Spinner, showToast } from '@/components'
import { searchService, institutionService } from '@/services'
import type { Institution } from '@/types'

const CATEGORIES = ['Saúde', 'Crianças', 'Idosos', 'Animais', 'Educação', 'Meio Ambiente', 'Moradia', 'Alimentação']

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-30">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="search" placeholder="Pesquise uma instituição" class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-salvee-orange/30 transition-all" />
      </div>
    </header>
    <div class="flex-1 overflow-y-auto pb-24">
      <div id="search-results" class="hidden p-4 flex flex-col gap-3"></div>
      <div id="discovery-content">
        <div class="p-4">
          <h2 class="text-base font-semibold text-gray-900 mb-3">Categorias</h2>
          <div class="grid grid-cols-2 gap-2" id="categories-grid"></div>
        </div>
        <div class="px-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900">Destaques</h2>
            <button class="text-salvee-orange text-sm font-medium">Veja todos</button>
          </div>
          <div id="highlights-list" class="flex flex-col gap-3"></div>
        </div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  renderCategories()
  loadHighlights()

  let searchTimeout: ReturnType<typeof setTimeout>
  document.getElementById('search-input')!.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    const q = (e.target as HTMLInputElement).value.trim()
    searchTimeout = setTimeout(() => performSearch(q), 400)
  })
}

function renderCategories(): void {
  const grid = document.getElementById('categories-grid')!
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button')
    btn.className = 'p-3 rounded-xl bg-white border border-gray-100 text-sm font-medium text-gray-700 text-left hover:border-salvee-orange hover:text-salvee-orange transition-colors'
    btn.textContent = cat
    btn.addEventListener('click', () => performSearch(cat))
    grid.appendChild(btn)
  })
}

async function loadHighlights(): Promise<void> {
  const list = document.getElementById('highlights-list')!
  list.appendChild(Spinner())
  try {
    const institutions = await institutionService.list()
    list.innerHTML = ''
    institutions.slice(0, 3).forEach(inst => list.appendChild(renderInstitutionCard(inst)))
  } catch {
    list.innerHTML = ''
    getMockInstitutions().forEach(inst => list.appendChild(renderInstitutionCard(inst)))
  }
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

function getMockInstitutions(): Institution[] {
  return [
    { id: 'inst1', name: 'Instituto Esperança', category: 'Crianças', verified: true, status: 'approved', description: '', photos: [] },
    { id: 'inst2', name: 'Lar dos Idosos Felizes', category: 'Idosos', verified: true, status: 'approved', description: '', photos: [] },
    { id: 'inst3', name: 'ONG Verde', category: 'Meio Ambiente', verified: false, status: 'pending', description: '', photos: [] },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
