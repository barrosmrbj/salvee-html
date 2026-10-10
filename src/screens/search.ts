// src/screens/search.ts — busca e descoberta (spec 17)
// 1. barra de pesquisa (instituições e campanhas, por nome, categoria ou palavra-chave)
// 2. carrossel "Promoções & metas" (mockup dos designers): banners do admin ou campanhas em destaque
//    (as categorias do PDF 17.4 ficam no filtro de "Causas perto de você", como no mockup)
// 3. Destaques: instituições com menos ajuda recente
// 4. Causas perto de você: campanhas em andamento, primeiro as da cidade escolhida
import { BottomNav, ProgressBar, Spinner, VerifiedBadge, showToast } from '@/components'
import { searchService } from '@/services'
import { request } from '@/services/api'
import type { PromoItem, SearchCampaign } from '@/services/search.service'
import type { Institution } from '@/types'

const CITY_KEY = 'salvee_cidade'
const GPS_KEY = 'salvee_gps' // preferência do usuário: 'on' liga o GPS em "Causas perto de você"
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
      <section id="promo-section" class="px-4 pt-4">
        <div id="promo-track" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"></div>
        <div id="promo-dots" class="flex justify-center gap-1.5 mt-2"></div>
      </section>

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
          <div class="flex items-center justify-between gap-2 px-4 mb-1">
            <h2 class="text-base font-bold text-gray-900">Causas perto de você</h2>
            <div class="flex items-center gap-2">
              <button id="gps-toggle" type="button" class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border"></button>
              <button id="category-toggle" type="button" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Filtrar por categoria" aria-expanded="false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div id="category-chips" class="hidden flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"></div>
          <div class="flex items-center justify-between gap-2 px-4 mb-3">
            <p id="gps-status" class="text-[11px] text-gray-400"></p>
            <label id="city-label" class="flex items-center gap-1 text-xs text-gray-500">
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

  buildPromos()
  buildCategories()
  buildDestaques()
  setupGps()
  void buildCities().then(buildCausas)

  document.getElementById('search-input')!.addEventListener('input', e => {
    clearTimeout(searchTimeout)
    query = (e.target as HTMLInputElement).value.trim()
    searchTimeout = setTimeout(refresh, 400)
  })
}

// termo digitado → resultados; vazio → descoberta (promoções, destaques, causas)
function refresh(): void {
  const results = document.getElementById('search-results')!
  const discovery = document.getElementById('discovery-content')!
  const searching = Boolean(query)
  results.classList.toggle('hidden', !searching)
  discovery.classList.toggle('hidden', searching)
  document.getElementById('promo-section')!.classList.toggle('hidden', searching)
  if (searching) void performSearch()
}

// ---- Promoções & metas (topo, mockup) ----
let promoTimer: ReturnType<typeof setInterval> | undefined

function buildPromos(): void {
  const section = document.getElementById('promo-section')!
  const track = document.getElementById('promo-track')!
  const dots = document.getElementById('promo-dots')!
  searchService.listPromos().then(items => {
    if (!items.length) { section.classList.add('hidden'); return }
    items.forEach((p, i) => {
      track.appendChild(promoCard(p))
      const dot = document.createElement('span')
      dot.className = `w-2 h-2 rounded-full transition-colors ${i === 0 ? 'bg-salvee-orange' : 'bg-gray-300'}`
      dots.appendChild(dot)
    })
    if (items.length === 1) dots.classList.add('hidden')
    const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth))
    track.addEventListener('scroll', () => {
      const idx = current()
      dots.querySelectorAll('span').forEach((d, i) => {
        d.className = `w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-salvee-orange' : 'bg-gray-300'}`
      })
    })
    // passa sozinho a cada 6 s
    if (items.length > 1) {
      promoTimer = setInterval(() => {
        const next = (current() + 1) % items.length
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
      }, 6000)
    }
  }).catch(() => section.classList.add('hidden'))
}

function promoCard(p: PromoItem): HTMLElement {
  const card = document.createElement(p.link ? 'button' : 'div') as HTMLElement
  if (p.link) (card as HTMLButtonElement).type = 'button'
  card.className = 'relative flex-shrink-0 w-full snap-center h-40 rounded-2xl overflow-hidden bg-salvee-orange text-left'
  if (p.imageUrl) {
    const img = document.createElement('img')
    img.src = p.imageUrl
    img.alt = ''
    img.className = 'absolute inset-0 w-full h-full object-cover'
    card.appendChild(img)
  }
  const overlay = document.createElement('div')
  overlay.className = 'absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent'
  const tag = document.createElement('span')
  tag.className = 'self-start text-[10px] font-bold uppercase tracking-wide text-white/90 bg-white/20 rounded-full px-2 py-0.5 mb-1'
  tag.textContent = p.kind === 'promo' ? 'Promoção' : 'Meta'
  const title = document.createElement('p')
  title.className = 'text-white font-bold text-lg leading-tight'
  title.textContent = p.title
  overlay.append(tag, title)
  if (p.subtitle) {
    const sub = document.createElement('p')
    sub.className = 'text-white/80 text-xs mt-0.5 truncate'
    sub.textContent = p.subtitle
    overlay.appendChild(sub)
  }
  if (p.progress && p.progress.goal > 0) {
    const pct = Math.min(100, Math.round((p.progress.current / p.progress.goal) * 100))
    const bar = document.createElement('div')
    bar.className = 'mt-2 h-1.5 rounded-full bg-white/30 overflow-hidden'
    const fill = document.createElement('div')
    fill.className = 'h-full bg-salvee-orange rounded-full'
    fill.style.width = `${pct}%`
    bar.appendChild(fill)
    const label = document.createElement('p')
    label.className = 'text-white/80 text-[11px] mt-1'
    label.textContent = `${pct}% · R$ ${p.progress.current.toLocaleString('pt-BR')} de R$ ${p.progress.goal.toLocaleString('pt-BR')}`
    overlay.append(bar, label)
  }
  card.appendChild(overlay)
  if (p.link) card.addEventListener('click', () => { window.location.hash = p.link! })
  return card
}

// ---- categorias (spec 17.4): filtro de "Causas perto de você" (ícone ao lado do título, como no mockup) ----
function buildCategories(): void {
  const chips = document.getElementById('category-chips')!
  const toggle = document.getElementById('category-toggle')!
  toggle.addEventListener('click', () => {
    const open = chips.classList.toggle('hidden') === false
    toggle.setAttribute('aria-expanded', String(open))
    toggle.classList.toggle('text-salvee-orange', open || Boolean(category))
  })
  searchService.listCategories().then(list => {
    const items = [{ name: '', label: 'Todas' }, ...list.map(c => ({ name: c.name, label: `${CATEGORY_ICONS[c.name] ?? '💛'} ${c.name}` }))]
    items.forEach(item => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.dataset['category'] = item.name
      chip.textContent = item.label
      chip.addEventListener('click', () => {
        category = item.name
        paintCategories()
        toggle.classList.toggle('text-salvee-orange', Boolean(category))
        void buildCausas()
      })
      chips.appendChild(chip)
    })
    paintCategories()
  }).catch(() => toggle.classList.add('hidden'))
}

function paintCategories(): void {
  document.querySelectorAll<HTMLButtonElement>('#category-chips [data-category]').forEach(chip => {
    const active = chip.dataset['category'] === category
    chip.className = `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
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
  select.addEventListener('change', () => { setCity(select.value); void buildCausas() })
}

// ---- GPS do usuário (opcional, ele liga ou desliga) ----
let gpsOn = false
let position: { lat: number; lng: number } | null = null

function getPref(key: string): string {
  try { return localStorage.getItem(key) ?? '' } catch { return '' }
}
function setPref(key: string, value: string): void {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key) } catch { /* sem armazenamento */ }
}

function paintGps(text?: string): void {
  const btn = document.getElementById('gps-toggle')!
  btn.className = `flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
    gpsOn ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
  }`
  btn.textContent = gpsOn ? '📍 Perto de mim: ligado' : '📍 Perto de mim'
  btn.setAttribute('aria-pressed', String(gpsOn))
  document.getElementById('gps-status')!.textContent = text ?? (gpsOn
    ? 'Usando sua localização (não fica guardada).'
    : 'Ligue para ver as campanhas mais próximas, ou escolha a cidade.')
  // com GPS ligado a cidade não é usada
  document.getElementById('city-label')!.classList.toggle('opacity-40', gpsOn)
}

function locate(): Promise<boolean> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) { resolve(false); return }
    navigator.geolocation.getCurrentPosition(
      pos => { position = { lat: pos.coords.latitude, lng: pos.coords.longitude }; resolve(true) },
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    )
  })
}

function setupGps(): void {
  gpsOn = getPref(GPS_KEY) === 'on'
  paintGps(gpsOn ? 'Obtendo sua localização…' : undefined)
  document.getElementById('gps-toggle')!.addEventListener('click', async () => {
    if (gpsOn) {
      gpsOn = false
      position = null
      setPref(GPS_KEY, '')
      paintGps()
      buildCausas()
      return
    }
    paintGps('Obtendo sua localização…')
    if (await locate()) {
      gpsOn = true
      setPref(GPS_KEY, 'on')
      paintGps()
    } else {
      // negou ou não conseguiu: continua pela cidade (fallback do PDF, 27.5)
      showToast('Não foi possível usar a localização. Mostrando pela cidade escolhida.', 'info', 4000)
      paintGps()
    }
    buildCausas()
  })
}

async function buildCausas(): Promise<void> {
  const list = document.getElementById('causas-list')!
  list.innerHTML = ''
  list.appendChild(Spinner())
  // preferência ligada numa visita anterior: pega a posição de novo
  if (gpsOn && !position && !(await locate())) {
    gpsOn = false
    setPref(GPS_KEY, '')
    paintGps('Localização indisponível. Mostrando pela cidade escolhida.')
  }
  const city = (document.getElementById('city-select') as HTMLSelectElement).value
  const params = gpsOn && position ? { lat: position.lat, lng: position.lng, category } : { city, category }
  searchService.listCausas(params).then(causas => {
    list.innerHTML = ''
    if (!causas.length) return emptyText(list, category ? `Nenhuma campanha em andamento em ${category}.` : 'Nenhuma campanha em andamento no momento.')
    if (gpsOn && !causas.some(c => c.nearby)) emptyText(list, 'Nenhuma campanha a até 30 km. Veja as mais próximas:')
    else if (!gpsOn && city && !causas.some(c => c.nearby)) emptyText(list, `Ainda não há campanhas em ${city}. Veja as de outras cidades:`)
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
  const where = c.distanceKm != null ? `📍 a ${c.distanceKm.toLocaleString('pt-BR')} km` : c.nearby ? '📍 perto de você' : ''
  cat.textContent = [c.category, where].filter(Boolean).join(' · ') || 'Campanha'
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
    const { institutions, campaigns } = await searchService.search(query)
    results.innerHTML = ''
    if (!institutions.length && !campaigns.length) {
      emptyText(results, `Nada encontrado para "${query}".`)
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
  clearInterval(promoTimer)
  query = ''
  category = ''
  position = null
  document.getElementById('bottom-nav')?.remove()
}
