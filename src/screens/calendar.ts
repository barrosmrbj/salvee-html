// src/screens/calendar.ts
import { BottomNav, Spinner } from '@/components'
import { calendarService } from '@/services'
import type { CalendarEvent } from '@/types'

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
const STRIP_DAYS_BEFORE = 7
const STRIP_DAYS_AFTER = 45
const CELL_WIDTH = 44

let allEvents: CalendarEvent[] = []
let selectedDate: string | null = null
let activeCategory: string | null = null

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="overflow-y-auto pb-24">
      <header class="px-4 pt-5 pb-2">
        <h1 class="text-2xl font-extrabold text-gray-900">Próximas atividades</h1>
        <p id="month-summary" class="text-sm font-semibold text-salvee-orange mt-1"></p>
      </header>

      <div class="mx-4 mt-2 rounded-2xl border border-gray-100 shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <span id="strip-month-label" class="text-lg font-bold text-gray-900 capitalize"></span>
          <div class="flex items-center gap-2">
            <button id="strip-prev" class="w-7 h-7 flex items-center justify-center text-salvee-orange" aria-label="Semana anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button id="strip-next" class="w-7 h-7 flex items-center justify-center text-salvee-orange" aria-label="Próxima semana">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div id="day-strip" class="flex gap-1 overflow-x-auto scrollbar-hide snap-x"></div>
      </div>

      <div id="filter-chips" class="flex gap-2 overflow-x-auto px-4 pt-4 pb-1 scrollbar-hide"></div>

      <div class="px-4 mt-3">
        <h2 class="text-base font-bold text-gray-900 mb-3">Eventos</h2>
        <div id="events-list" class="flex flex-col gap-3"></div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  const list = document.getElementById('events-list')!

  const spinnerWrapper = document.createElement('div')
  spinnerWrapper.className = 'flex justify-center py-8'
  spinnerWrapper.appendChild(Spinner())
  list.appendChild(spinnerWrapper)

  document.getElementById('strip-prev')!.addEventListener('click', () => scrollStrip(-1))
  document.getElementById('strip-next')!.addEventListener('click', () => scrollStrip(1))
  document.getElementById('day-strip')!.addEventListener('scroll', updateStripMonthLabel)

  calendarService.getMyEvents().then(events => {
    spinnerWrapper.remove()
    allEvents = events
    afterEventsLoaded()
  }).catch(() => {
    spinnerWrapper.remove()
    allEvents = getMockEvents()
    afterEventsLoaded()
  })
}

function afterEventsLoaded(): void {
  buildDayStrip()
  buildFilterChips()
  renderEventsList()
  updateMonthSummary()
}

function updateMonthSummary(): void {
  const now = new Date()
  const count = allEvents.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const summary = document.getElementById('month-summary')!
  summary.textContent = count === 1 ? '1 evento confirmado este mês' : `${count} eventos confirmados este mês`
}

function buildDayStrip(): void {
  const strip = document.getElementById('day-strip')!
  strip.innerHTML = ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - STRIP_DAYS_BEFORE)

  const eventDateSet = new Set(allEvents.map(e => dateKey(new Date(e.date))))
  const todayKey = dateKey(today)
  if (!selectedDate) selectedDate = todayKey

  for (let i = 0; i < STRIP_DAYS_BEFORE + STRIP_DAYS_AFTER; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = dateKey(d)

    const cell = document.createElement('button')
    cell.dataset.dateKey = key
    cell.className = 'flex-shrink-0 flex flex-col items-center gap-1.5 py-1 snap-start'
    cell.style.width = `${CELL_WIDTH}px`

    const isSelected = key === selectedDate
    cell.innerHTML = `
      <span class="text-[10px] font-semibold text-gray-400">${WEEKDAYS[d.getDay()]}</span>
      <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
        isSelected ? 'bg-salvee-orange text-white' : 'text-gray-800'
      }">${d.getDate()}</span>
      <span class="w-1 h-1 rounded-full ${eventDateSet.has(key) ? 'bg-salvee-orange' : 'bg-transparent'}"></span>
    `
    cell.addEventListener('click', () => {
      selectedDate = key
      buildDayStrip()
      scrollStripToSelected(false)
    })
    strip.appendChild(cell)
  }

  scrollStripToSelected(true)
  updateStripMonthLabel()
}

function scrollStripToSelected(instant: boolean): void {
  const strip = document.getElementById('day-strip')!
  const target = strip.querySelector<HTMLElement>(`[data-date-key="${selectedDate}"]`)
  if (!target) return
  const offset = target.offsetLeft - strip.clientWidth / 2 + CELL_WIDTH / 2
  strip.scrollTo({ left: Math.max(0, offset), behavior: instant ? 'auto' : 'smooth' })
}

function scrollStrip(direction: 1 | -1): void {
  const strip = document.getElementById('day-strip')!
  strip.scrollBy({ left: direction * CELL_WIDTH * 7, behavior: 'smooth' })
}

function updateStripMonthLabel(): void {
  const strip = document.getElementById('day-strip')!
  const label = document.getElementById('strip-month-label')!
  const centerX = strip.scrollLeft + strip.clientWidth / 2
  let closest: HTMLElement | null = null
  let closestDist = Infinity
  strip.querySelectorAll<HTMLElement>('[data-date-key]').forEach(cell => {
    const dist = Math.abs(cell.offsetLeft + CELL_WIDTH / 2 - centerX)
    if (dist < closestDist) { closestDist = dist; closest = cell }
  })
  const key = (closest as HTMLElement | null)?.dataset.dateKey
  if (!key) return
  const d = new Date(key)
  label.textContent = d.toLocaleDateString('pt-BR', { month: 'long' })
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildFilterChips(): void {
  const container = document.getElementById('filter-chips')!
  container.innerHTML = ''

  const categories = Array.from(new Set(allEvents.map(e => e.category).filter((c): c is string => !!c)))
  const filters = ['Todos', ...categories]

  filters.forEach(f => {
    const chip = document.createElement('button')
    const isActive = (f === 'Todos' && activeCategory === null) || f === activeCategory
    chip.className = `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      isActive ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-salvee-orange border-salvee-orange/40'
    }`
    chip.textContent = f
    chip.addEventListener('click', () => {
      activeCategory = f === 'Todos' ? null : f
      buildFilterChips()
      renderEventsList()
    })
    container.appendChild(chip)
  })
}

function renderEventsList(): void {
  const container = document.getElementById('events-list')!
  container.innerHTML = ''

  const filtered = activeCategory ? allEvents.filter(e => e.category === activeCategory) : allEvents

  if (filtered.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'text-center py-16'
    empty.innerHTML = `
      <p class="text-4xl mb-3">📅</p>
      <p class="text-gray-500 font-medium">Nenhum evento confirmado ainda</p>
      <p class="text-gray-400 text-sm mt-1">Explore o feed e participe de eventos!</p>
    `
    container.appendChild(empty)
    return
  }

  filtered.forEach(event => container.appendChild(renderEventCard(event)))
}

function renderEventCard(event: CalendarEvent): HTMLElement {
  const card = document.createElement('button')
  card.className = 'w-full bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 text-left hover:border-salvee-orange/40 transition-colors'
  card.addEventListener('click', () => { window.location.hash = `/institution/${event.institutionId}` })

  const thumb = document.createElement('div')
  thumb.className = 'w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center'
  thumb.innerHTML = event.imageUrl
    ? `<img src="${event.imageUrl}" alt="" class="w-full h-full object-cover" />`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`
  card.appendChild(thumb)

  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0'
  info.innerHTML = `
    <p class="font-bold text-gray-900 text-sm truncate">${event.title}</p>
    <p class="text-xs text-gray-400 mt-0.5">${formatEventDateTime(event.date)}</p>
    <p class="text-xs text-gray-400 truncate">${event.location}</p>
    ${event.category ? `<p class="text-xs font-semibold text-salvee-orange mt-0.5">${event.category}</p>` : ''}
  `
  card.appendChild(info)

  const chevron = document.createElement('div')
  chevron.className = 'flex-shrink-0'
  chevron.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300"><path d="M9 18l6-6-6-6"/></svg>'
  card.appendChild(chevron)

  return card
}

function formatEventDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const time = minutes > 0 ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`
  return `${day} ${month} - ${time}`
}

function getMockEvents(): CalendarEvent[] {
  const now = new Date()
  return [
    { id: '1', institutionId: 'inst3', institutionName: 'ONG Verde', title: 'Projeto Verônica', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0).toISOString(), location: 'Compensa, Manaus', registered: true, category: 'Social' },
    { id: '2', institutionId: 'inst1', institutionName: 'Instituto Esperança', title: 'Terço Jovem', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 0).toISOString(), location: 'Paróquia São José', registered: true, category: 'Evangelização' },
    { id: '3', institutionId: 'inst2', institutionName: 'Lar dos Idosos Felizes', title: 'Almoço 28 de Agosto', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0).toISOString(), location: 'Compensa, Manaus', registered: true, category: 'Social' },
    { id: '4', institutionId: 'inst1', institutionName: 'Abrigo Meu Pet', title: 'Feira de Adoção', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 9, 0).toISOString(), location: 'Praça da Saudade', registered: true, category: 'Abrigos' },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
  selectedDate = null
  activeCategory = null
}
