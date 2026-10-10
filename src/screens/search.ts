// src/screens/search.ts — busca e descoberta (spec 17)
// 1. barra de pesquisa (instituições e campanhas, por nome, categoria ou palavra-chave)
// 2. carrossel de categorias (as que existem nas instituições aprovadas)
// 3. Destaques: instituições com menos ajuda recente
// 4. Causas perto de você: campanhas em andamento, primeiro as da cidade escolhida
import { BottomNav, ProgressBar, Spinner, VerifiedBadge } from '@/components'
import { searchService } from '@/services'
import { request } from '@/services/api'
import type { SearchCampaign } from '@/services/search.service'
import type { Institution } from '@/types'

const CITY_KEY = 'salvee_cidade'
const CATEGORY_ICONS: Record<string, string> = {
  'Saúde': '🏥', 'Crianças': '🧒', 'Idosos': '👵', 'Educação': '📚', 'Animais': '🐾', 'Alimentação': '🍲',
  'Meio Ambiente': '🌱', 'Moradia': '🏠', 'Abrigos': '🏠', 'Asilos': '👵', 'Creches': '🧸', 'Igrejas': '⛪', 'Outros': '💛',
}

let query = ''
let category = ''
let searchTimeout: ReturnType<typeof setTimeout> | undefined

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-30">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="search" placeholder="Busque instituições, campanhas ou causas" aria-label="Buscar"
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-salvee-orange/30 transition-all" />
      </div>
    </header>

    <div class="flex-1 overflow-y-auto pb-24">
      <div id="category-track" class="flex gap-3 overflow-x-auto px-4 pt-4 pb-1 scrollbar-hide"></div>

      <div id="search-results" class="hidden p-4 flex flex-col gap-5"></div>

      <div id="discovery-content">
        <section class="mt-5">
          <div class="px-4 mb-3">
            <h2 class="text-base font-bold text-gray-900">Destaques</h2>
            <p class="text-xs text-gray-400">Instituições que receberam pouca ajuda recentemente</p>
          </div>
          <div id="destaques-list" class="flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide"></div>
        </section>

        <section class="mt-6">
          <div class="flex items-center justify-between gap-2 px-4 mb-3">
            <h2 class="text-base font-bold text-gray-900">Causas perto de você</h2>
            <label class="flex items-center gap-1 text-xs text-gray-500">
              <span aria-hidden="true">📍</span>
              <select id="city-select" class="bg-transparent text-xs font-semibold text-salvee-orange outline-none max-w-[9rem]" aria-label="Cidade"></select>
            </label>
          </div>
          <div id="causas-list" class="flex flex-col gap-3 px-4"></div>
        </section>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())

  buildCategories()
  buildDestaques()
  void buildCities().then(buildCausas)

  document.getElementById('search-input')!.addEventListener('input', e => {
    clearTimeout(searchTimeout)
    query = (e.target as HTMLInputElement).value.trim()
    searchTimeout = setTimeout(refresh, 400)
  })
}

// termo ou categoria escolhidos → resultados; nenhum → descoberta
function refresh(): void {
  const results = document.getElementById('search-results')!
  const discovery = document.getElementById('discovery-content')!
  const searching = Boolean(query || category)
  results.classList.toggle('hidden', !searching)
  discovery.classList.toggle('hidden', searching)
  if (searching) void performSearch()
}

// ---- categorias (spec 17.4) ----
function buildCategories(): void {
  const track = document.getElementById('category-track')!
  searchService.listCategories().then(list => {
    track.innerHTML = ''
    const items = [{ name: '', label: 'Todas', icon: '✨' }, ...list.map(c => ({ name: c.name, label: c.name, icon: CATEGORY_ICONS[c.name] ?? '💛' }))]
    items.forEach(item => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.dataset['category'] = item.name
      btn.className = 'flex-shrink-0 flex flex-col items-center gap-1 w-20'
      const circle = document.createElement('span')
      circle.className = 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-colors'
      circle.textContent = item.icon
      const label = document.createElement('span')
      label.className = 'text-[11px] font-medium text-gray-600 text-center leading-tight truncate w-full'
      label.textContent = item.label
      btn.append(circle, label)
      btn.addEventListener('click', () => {
        category = item.name
        paintCategories()
        refresh()
      })
      track.appendChild(btn)
    })
    paintCategories()
  }).catch(() => track.classList.add('hidden'))
}

function paintCategories(): void {
  document.querySelectorAll<HTMLButtonElement>('#category-track [data-category]').forEach(btn => {
    const active = btn.dataset['category'] === category
    const circle = btn.firstElementChild as HTMLElement
    circle.className = `w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-colors ${
      active ? 'border-salvee-orange bg-salvee-orange-bg' : 'border-transparent bg-white shadow-sm'
    }`
  })
}

// ---- destaques (spec 17.5) ----
function buildDestaques(): void {
  const list = document.getElementById('destaques-list')!
  list.appendChild(Spinner())
  request<Array<{ id: string; name: string; logoUrl: string | null }>>('/institutions/destaques').then(insts => {
    list.innerHTML = ''
    if (!insts.length) return emptyText(list, 'Ainda não há instituições aprovadas.')
    insts.forEach(inst => {
      const item = document.createElement('button')
      item.type = 'button'
      item.className = 'flex-shrink-0 flex flex-col items-center gap-2 w-16'
      const logo = document.createElement('div')
      logo.className = 'w-16 h-16 rounded-full bg-white shadow-sm overflow-hidden flex items-center justify-center text-2xl'
      if (inst.logoUrl) {
        const img = document.createElement('img')
        img.src = inst.logoUrl
        img.alt = ''
        img.className = 'w-full h-full object-cover'
        logo.appendChild(img)
      } else {
        logo.textContent = '🏢'
      }
      const name = document.createElement('span')
      name.className = 'text-xs text-gray-700 text-center w-16 truncate'
      name.textContent = inst.name
      item.append(logo, name)
      item.addEventListener('click', () => { window.location.hash = `/institution/${inst.id}` })
      list.appendChild(item)
    })
  }).catch(() => {
    list.innerHTML = ''
    emptyText(list, 'Não foi possível carregar os destaques.')
  })
}

// ---- causas perto de você (spec 17.6) ----
function getCity(): string {
  try { return localStorage.getItem(CITY_KEY) ?? '' } catch { return '' }
}
function setCity(city: string): void {
  try { city ? localStorage.setItem(CITY_KEY, city) : localStorage.removeItem(CITY_KEY) } catch { /* sem armazenamento */ }
}

// sem coordenadas no cadastro: "perto" = cidade escolhida (fallback do PDF: pedir a cidade)
async function buildCities(): Promise<void> {
  const select = document.getElementById('city-select') as HTMLSelectElement
  const all = document.createElement('option')
  all.value = ''
  all.textContent = 'Todas as cidades'
  select.appendChild(all)
  try {
    const cities = await searchService.listCities()
    cities.forEach(c => {
      const o = document.createElement('option')
      o.value = c.city
      o.textContent = c.state ? `${c.city} - ${c.state}` : c.city
      select.appendChild(o)
    })
  } catch { /* só "Todas" */ }
  const saved = getCity()
  if ([...select.options].some(o => o.value === saved)) select.value = saved
  select.addEventListener('change', () => { setCity(select.value); buildCausas() })
}

function buildCausas(): void {
  const list = document.getElementById('causas-list')!
  list.innerHTML = ''
  list.appendChild(Spinner())
  const city = (document.getElementById('city-select') as HTMLSelectElement).value
  searchService.listCausas({ city }).then(causas => {
    list.innerHTML = ''
    if (!causas.length) return emptyText(list, 'Nenhuma campanha em andamento no momento.')
    if (city && !causas.some(c => c.nearby)) emptyText(list, `Ainda não há campanhas em ${city}. Veja as de outras cidades:`)
    causas.forEach(c => list.appendChild(campaignItem(c)))
  }).catch(() => {
    list.innerHTML = ''
    emptyText(list, 'Não foi possível carregar as campanhas.')
  })
}

// item de campanha: imagem, categoria, título, instituição, progresso e arrecadado (spec 17.6)
function campaignItem(c: SearchCampaign): HTMLElement {
  const item = document.createElement('button')
  item.type = 'button'
  item.className = 'w-full flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-left'
  const thumb = document.createElement('div')
  thumb.className = 'w-20 h-20 rounded-xl bg-salvee-orange-bg flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl'
  if (c.imageUrl) {
    const img = document.createElement('img')
    img.src = c.imageUrl
    img.alt = ''
    img.className = 'w-full h-full object-cover'
    thumb.appendChild(img)
  } else {
    thumb.textContent = '🎯'
  }
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0 flex flex-col gap-1'
  const cat = document.createElement('span')
  cat.className = 'text-[11px] text-salvee-orange font-semibold'
  cat.textContent = [c.category, c.nearby ? '📍 perto de você' : ''].filter(Boolean).join(' · ') || 'Campanha'
  const title = document.createElement('p')
  title.className = 'text-sm font-semibold text-gray-900 truncate'
  title.textContent = c.title
  const inst = document.createElement('p')
  inst.className = 'text-xs text-gray-400 truncate'
  inst.textContent = [c.institutionName, c.city].filter(Boolean).join(' · ')
  info.append(cat, title, inst)
  if (c.goal > 0) {
    info.appendChild(ProgressBar(c.current, c.goal, false))
    const raised = document.createElement('p')
    raised.className = 'text-[11px] text-gray-500'
    raised.textContent = `R$ ${c.current.toLocaleString('pt-BR')} de R$ ${c.goal.toLocaleString('pt-BR')}`
    info.appendChild(raised)
  }
  item.append(thumb, info)
  item.addEventListener('click', () => { window.location.hash = `/campanha/${c.id}` })
  return item
}

// ---- resultados (spec 17.3) ----
async function performSearch(): Promise<void> {
  const results = document.getElementById('search-results')!
  results.innerHTML = ''
  results.appendChild(Spinner())
  try {
    const { institutions, campaigns } = await searchService.search(query, category)
    results.innerHTML = ''
    if (!institutions.length && !campaigns.length) {
      emptyText(results, query ? `Nada encontrado para "${query}"${category ? ` em ${category}` : ''}.` : `Ainda não há nada em ${category}.`)
      return
    }
    if (campaigns.length) {
      results.appendChild(sectionTitle(`Campanhas (${campaigns.length})`))
      const list = document.createElement('div')
      list.className = 'flex flex-col gap-3'
      campaigns.forEach(c => list.appendChild(campaignItem(c)))
      results.appendChild(list)
    }
    if (institutions.length) {
      results.appendChild(sectionTitle(`Instituições (${institutions.length})`))
      const list = document.createElement('div')
      list.className = 'flex flex-col gap-3'
      institutions.forEach(i => list.appendChild(institutionItem(i)))
      results.appendChild(list)
    }
  } catch {
    results.innerHTML = ''
    emptyText(results, 'Erro na busca. Tente novamente.')
  }
}

function institutionItem(inst: Institution): HTMLElement {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left hover:border-salvee-orange transition-colors'
  const logo = document.createElement('div')
  logo.className = 'w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400'
  if (inst.logoUrl) {
    const img = document.createElement('img')
    img.src = inst.logoUrl
    img.alt = ''
    img.className = 'w-full h-full object-cover'
    logo.appendChild(img)
  } else {
    logo.textContent = '🏢'
  }
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0'
  const nameRow = document.createElement('div')
  nameRow.className = 'flex items-center gap-1 mb-0.5'
  const name = document.createElement('span')
  name.className = 'font-semibold text-gray-900 text-sm truncate'
  name.textContent = inst.name
  nameRow.appendChild(name)
  if (inst.verified) nameRow.appendChild(VerifiedBadge())
  const meta = document.createElement('span')
  meta.className = 'text-xs text-gray-500'
  meta.textContent = [inst.category, inst.city].filter(Boolean).join(' · ')
  info.append(nameRow, meta)
  card.append(logo, info)
  card.addEventListener('click', () => { window.location.hash = `/institution/${inst.id}` })
  return card
}

function sectionTitle(text: string): HTMLElement {
  const h = document.createElement('h2')
  h.className = 'text-sm font-bold text-gray-900'
  h.textContent = text
  return h
}

function emptyText(container: HTMLElement, text: string): void {
  const p = document.createElement('p')
  p.className = 'text-xs text-gray-400 py-4 text-center w-full'
  p.textContent = text
  container.appendChild(p)
}

export function unmount(): void {
  clearTimeout(searchTimeout)
  query = ''
  category = ''
  document.getElementById('bottom-nav')?.remove()
}
