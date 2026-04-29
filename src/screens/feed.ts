// src/screens/feed.ts
import { BottomNav, Avatar, ProgressBar, Spinner, showToast } from '@/components'
import { feedService } from '@/services'
import type { Post } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
      <div class="w-8 h-8 bg-salvee-orange rounded-full flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><path d="M14 20l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h1 class="text-base font-semibold text-gray-900">salvee</h1>
      <button id="notif-btn" class="w-8 h-8 flex items-center justify-center text-gray-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
    </header>
    <div id="feed-list" class="flex flex-col gap-3 p-4 pb-24"></div>
  `
  return el
}

export function mount(): void {
  const container = document.getElementById('feed-list')!
  const nav = BottomNav()
  document.getElementById('app')!.appendChild(nav)

  const spinner = document.createElement('div')
  spinner.className = 'flex justify-center py-8'
  spinner.appendChild(Spinner())
  container.appendChild(spinner)

  feedService.listPosts().then(posts => {
    spinner.remove()
    if (posts.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhuma postagem ainda.</p>'
      return
    }
    posts.forEach(p => container.appendChild(renderPost(p)))
  }).catch(() => {
    spinner.remove()
    showToast('Erro ao carregar feed', 'error')
    getMockPosts().forEach(p => container.appendChild(renderPost(p)))
  })
}

function renderPost(post: Post): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'

  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 p-4 pb-2'
  const avatarEl = Avatar(post.institutionName ?? 'Inst', post.institutionLogoUrl)
  header.appendChild(avatarEl)

  const headerInfo = document.createElement('div')
  headerInfo.className = 'flex-1 min-w-0'

  const nameRow = document.createElement('div')
  nameRow.className = 'flex items-center gap-1'
  const nameSpan = document.createElement('span')
  nameSpan.className = 'font-semibold text-gray-900 text-sm truncate'
  nameSpan.textContent = post.institutionName ?? ''
  nameRow.appendChild(nameSpan)

  if (post.institutionVerified) {
    const badge = document.createElement('span')
    badge.className = 'inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0'
    badge.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    nameRow.appendChild(badge)
  }
  headerInfo.appendChild(nameRow)

  const metaSpan = document.createElement('span')
  metaSpan.className = 'text-xs text-gray-400'
  metaSpan.textContent = `${post.institutionVerified ? 'Verificada' : 'Pendente'} · ${formatDate(post.createdAt)}`
  headerInfo.appendChild(metaSpan)
  header.appendChild(headerInfo)

  const menuBtn = document.createElement('button')
  menuBtn.className = 'text-gray-400'
  menuBtn.textContent = '···'
  header.appendChild(menuBtn)
  card.appendChild(header)

  if (post.imageUrl) {
    const img = document.createElement('img')
    img.src = post.imageUrl
    img.alt = ''
    img.className = 'w-full h-48 object-cover'
    card.appendChild(img)
  }

  const body = document.createElement('div')
  body.className = 'p-4'
  const contentP = document.createElement('p')
  contentP.className = 'text-gray-700 text-sm leading-relaxed line-clamp-3'
  contentP.textContent = post.content
  body.appendChild(contentP)

  if (post.type === 'campaign' && post.campaignGoal) {
    body.appendChild(ProgressBar(post.campaignCurrent ?? 0, post.campaignGoal))
  }

  if (post.type === 'event' && post.eventDate) {
    const eventInfo = document.createElement('div')
    eventInfo.className = 'flex items-center gap-2 text-xs text-gray-500 mt-2'
    const dateSpan = document.createElement('span')
    dateSpan.textContent = `📅 ${formatDate(post.eventDate)}`
    eventInfo.appendChild(dateSpan)
    if (post.eventLocation) {
      const locSpan = document.createElement('span')
      locSpan.textContent = `📍 ${post.eventLocation}`
      eventInfo.appendChild(locSpan)
    }
    body.appendChild(eventInfo)
  }

  card.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'px-4 pb-4'
  const ctaLabels: Record<string, string> = { common: 'Ajudar', campaign: 'Doar', event: 'Participar' }
  const cta = document.createElement('button')
  cta.className = 'w-full py-2.5 bg-salvee-orange text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform'
  cta.textContent = ctaLabels[post.type] ?? 'Ajudar'
  cta.addEventListener('click', () => {
    if (post.type === 'campaign' || post.type === 'common') {
      window.location.hash = `/donate/${post.institutionId}`
    } else {
      window.location.hash = `/institution/${post.institutionId}`
    }
  })
  footer.appendChild(cta)
  card.appendChild(footer)

  return card
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getMockPosts(): Post[] {
  return [
    { id: '1', institutionId: 'inst1', institutionName: 'Instituto Esperança', institutionVerified: true, type: 'campaign', content: 'Ajude-nos a construir uma nova ala para crianças carentes. Cada doação faz a diferença!', createdAt: new Date().toISOString(), campaignGoal: 10000, campaignCurrent: 6500 },
    { id: '2', institutionId: 'inst2', institutionName: 'Lar dos Idosos Felizes', institutionVerified: true, type: 'common', content: 'Hoje nossos residentes receberam a visita de uma turma de escola. Momentos assim enchem nossos corações!', createdAt: new Date().toISOString() },
    { id: '3', institutionId: 'inst3', institutionName: 'ONG Verde', institutionVerified: false, type: 'event', content: 'Mutirão de limpeza no Rio Negro. Venha participar!', createdAt: new Date().toISOString(), eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), eventLocation: 'Praia da Ponta Negra' },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
