// src/screens/calendar.ts
import { BottomNav, Spinner, showToast } from '@/components'
import { calendarService } from '@/services'
import type { CalendarEvent } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-30">
      <h1 class="text-xl font-bold text-gray-900">Minhas Ações</h1>
      <p class="text-sm text-gray-400">Eventos que você confirmou presença</p>
    </header>
    <div id="events-list" class="flex flex-col gap-3 p-4 pb-24"></div>
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

  calendarService.getMyEvents().then(events => {
    spinnerWrapper.remove()
    renderEvents(list, events)
  }).catch(() => {
    spinnerWrapper.remove()
    renderEvents(list, getMockEvents())
  })
}

function renderEvents(container: HTMLElement, events: CalendarEvent[]): void {
  if (events.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'text-center py-16'
    const emoji = document.createElement('p')
    emoji.className = 'text-4xl mb-3'
    emoji.textContent = '📅'
    const msg = document.createElement('p')
    msg.className = 'text-gray-500 font-medium'
    msg.textContent = 'Nenhum evento confirmado ainda'
    const sub = document.createElement('p')
    sub.className = 'text-gray-400 text-sm mt-1'
    sub.textContent = 'Explore o feed e participe de eventos!'
    empty.appendChild(emoji)
    empty.appendChild(msg)
    empty.appendChild(sub)
    container.appendChild(empty)
    return
  }

  let lastMonth = ''
  events.forEach(event => {
    const date = new Date(event.date)
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    if (monthYear !== lastMonth) {
      const header = document.createElement('h2')
      header.className = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1 capitalize'
      header.textContent = monthYear
      container.appendChild(header)
      lastMonth = monthYear
    }

    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex gap-4'

    const dateBox = document.createElement('div')
    dateBox.className = 'flex flex-col items-center justify-center w-12 h-12 bg-salvee-orange-bg rounded-xl flex-shrink-0'
    const daySpan = document.createElement('span')
    daySpan.className = 'text-salvee-orange font-bold text-lg leading-none'
    daySpan.textContent = String(date.getDate())
    const monthSpan = document.createElement('span')
    monthSpan.className = 'text-salvee-orange text-xs'
    monthSpan.textContent = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    dateBox.appendChild(daySpan)
    dateBox.appendChild(monthSpan)
    card.appendChild(dateBox)

    const info = document.createElement('div')
    info.className = 'flex-1'
    const titleP = document.createElement('p')
    titleP.className = 'font-semibold text-gray-900 text-sm'
    titleP.textContent = event.title
    const instP = document.createElement('p')
    instP.className = 'text-xs text-gray-500 mt-0.5'
    instP.textContent = event.institutionName
    const locP = document.createElement('p')
    locP.className = 'text-xs text-gray-400 mt-1'
    locP.textContent = `📍 ${event.location}`
    info.appendChild(titleP)
    info.appendChild(instP)
    info.appendChild(locP)
    card.appendChild(info)

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors'
    cancelBtn.title = 'Cancelar participação'
    cancelBtn.textContent = '✕'
    cancelBtn.addEventListener('click', async () => {
      try {
        await calendarService.unregisterFromEvent(event.id)
        card.remove()
        showToast('Participação cancelada', 'info')
      } catch {
        showToast('Erro ao cancelar', 'error')
      }
    })
    card.appendChild(cancelBtn)
    container.appendChild(card)
  })
}

function getMockEvents(): CalendarEvent[] {
  return [
    { id: '1', institutionId: 'inst3', institutionName: 'ONG Verde', title: 'Mutirão de Limpeza Rio Negro', date: new Date(Date.now() + 86400000 * 3).toISOString(), location: 'Praia da Ponta Negra', registered: true },
    { id: '2', institutionId: 'inst1', institutionName: 'Instituto Esperança', title: 'Bazar Solidário', date: new Date(Date.now() + 86400000 * 10).toISOString(), location: 'Av. Djalma Batista, 500', registered: true },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
