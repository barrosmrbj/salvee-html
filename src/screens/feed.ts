// src/screens/feed.ts
import { BottomNav, Avatar, VerifiedBadge, Spinner, showToast } from '@/components'
import { authService, feedService } from '@/services'
import type { Post } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white relative'
  el.innerHTML = `
    <header class="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      </div>
      <h1 id="greeting" class="flex-1 text-lg font-bold text-gray-900 truncate">Olá!</h1>
      <button id="settings-btn" class="text-gray-700 flex-shrink-0" aria-label="Configurações">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
      <button id="notif-btn" class="text-gray-700 flex-shrink-0" aria-label="Notificações">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
    </header>

    <div class="overflow-y-auto pb-28 px-4 pt-2">
      <div id="feed-list" class="flex flex-col gap-4"></div>
    </div>

    <div id="fab-container" class="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-app z-40 flex flex-col items-end gap-3 pr-4 pointer-events-none"></div>
  `
  return el
}

export function mount(): void {
  const nav = BottomNav()
  document.getElementById('app')!.appendChild(nav)

  loadGreeting()
  loadFeedPosts()
  buildFab()

  document.getElementById('settings-btn')!.addEventListener('click', () => { window.location.hash = '/settings' })
}

function loadGreeting(): void {
  const greeting = document.getElementById('greeting')!
  authService.getMe()
    .then(user => { greeting.textContent = `Olá, ${user.name.split(' ')[0]}!` })
    .catch(() => { greeting.textContent = 'Olá!' })
}

function loadFeedPosts(): void {
  const container = document.getElementById('feed-list')!
  const spinner = document.createElement('div')
  spinner.className = 'flex justify-center py-8'
  spinner.appendChild(Spinner())
  container.appendChild(spinner)

  feedService.listPosts().then(posts => {
    spinner.remove()
    if (posts.length === 0) return
    posts.forEach(p => container.appendChild(renderPost(p)))
  }).catch(() => {
    spinner.remove()
    getMockPosts().forEach(p => container.appendChild(renderPost(p)))
  })
}

function renderPost(post: Post): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-gray-50 rounded-2xl p-4 cursor-pointer'
  card.addEventListener('click', () => { window.location.hash = `/institution/${post.institutionId}` })

  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 mb-2'
  header.appendChild(Avatar(post.institutionName ?? 'Inst', post.institutionLogoUrl, 'sm'))

  const nameRow = document.createElement('div')
  nameRow.className = 'flex items-center gap-1 min-w-0'
  const nameSpan = document.createElement('span')
  nameSpan.className = 'font-semibold text-gray-900 text-sm truncate'
  nameSpan.textContent = post.institutionName ?? ''
  nameRow.appendChild(nameSpan)
  if (post.institutionVerified) nameRow.appendChild(VerifiedBadge())
  header.appendChild(nameRow)

  const timeSpan = document.createElement('span')
  timeSpan.className = 'ml-auto text-xs text-gray-400 flex-shrink-0'
  timeSpan.textContent = formatRelative(post.createdAt)
  header.appendChild(timeSpan)
  card.appendChild(header)

  const content = document.createElement('p')
  content.className = 'text-sm text-gray-600 leading-relaxed line-clamp-5'
  content.textContent = post.content
  card.appendChild(content)

  return card
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h atrás`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getMockPosts(): Post[] {
  return [
    { id: '1', institutionId: 'inst1', institutionName: 'Instituto Esperança', institutionVerified: true, type: 'campaign', content: 'Ajude-nos a construir uma nova ala para crianças carentes. Cada doação faz a diferença!', createdAt: new Date(Date.now() - 35 * 60000).toISOString(), campaignGoal: 10000, campaignCurrent: 6500 },
    { id: '2', institutionId: 'inst2', institutionName: 'Lar dos Idosos Felizes', institutionVerified: true, type: 'common', content: 'Hoje nossos residentes receberam a visita de uma turma de escola. Momentos assim enchem nossos corações!', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: '3', institutionId: 'inst3', institutionName: 'ONG Verde', institutionVerified: false, type: 'event', content: 'Mutirão de limpeza no Rio Negro. Venha participar!', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), eventLocation: 'Praia da Ponta Negra' },
  ]
}

let fabOpen = false

function buildFab(): void {
  const container = document.getElementById('fab-container')!
  container.innerHTML = ''

  const subActions = document.createElement('div')
  subActions.id = 'fab-actions'
  subActions.className = 'flex-col items-end gap-3'
  subActions.style.display = 'none'

  const photoBtn = fabButton(
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    'w-11 h-11',
    () => { showToast('Publicar com foto em breve', 'info'); closeFab() }
  )
  const newPostBtn = fabButton(
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'w-11 h-11',
    () => { showToast('Novo post em breve', 'info'); closeFab() }
  )
  subActions.appendChild(photoBtn)
  subActions.appendChild(newPostBtn)
  container.appendChild(subActions)

  const mainBtn = fabButton(
    '<svg id="fab-main-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'w-14 h-14 bg-salvee-orange-dark',
    () => { fabOpen ? closeFab() : openFab() }
  )
  mainBtn.id = 'fab-main-btn'
  container.appendChild(mainBtn)
}

function fabButton(icon: string, sizeClass: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.className = `${sizeClass} rounded-full bg-salvee-orange shadow-lg flex items-center justify-center active:scale-95 transition-transform pointer-events-auto`
  btn.innerHTML = icon
  btn.addEventListener('click', onClick)
  return btn
}

function openFab(): void {
  fabOpen = true
  document.getElementById('fab-actions')!.style.display = 'flex'
  document.getElementById('fab-main-icon')!.style.transform = 'rotate(45deg)'
}

function closeFab(): void {
  fabOpen = false
  document.getElementById('fab-actions')!.style.display = 'none'
  const icon = document.getElementById('fab-main-icon')
  if (icon) icon.style.transform = 'rotate(0deg)'
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
