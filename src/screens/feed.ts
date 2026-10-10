// src/screens/feed.ts
import { BottomNav, PostCard, Spinner } from '@/components'
import { authService, feedService, institutionService } from '@/services'

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
      <div id="feed-tabs" class="flex gap-2 mb-4"></div>
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
  buildTabs()
  loadFeedPosts()
  // botão "+" só para o responsável por instituição aprovada (spec 5 e 12.2)
  institutionService.listMine()
    .then(list => {
      if (list.some(i => i.status === 'approved')) buildFab()
      const waiting = list.find(i => i.status !== 'approved')
      if (waiting) showInstitutionBanner(waiting.status)
    })
    .catch(() => {})

  document.getElementById('settings-btn')!.addEventListener('click', () => { window.location.hash = '/settings' })
}

function loadGreeting(): void {
  const greeting = document.getElementById('greeting')!
  authService.getMe()
    .then(user => { greeting.textContent = `Olá, ${user.name.split(' ')[0]}!` })
    .catch(() => { greeting.textContent = 'Olá!' })
}

// "Para você" (todas) ou "Seguindo" (só instituições que a pessoa segue, spec 11.2)
let onlyFollowing = false

function buildTabs(): void {
  const tabs = document.getElementById('feed-tabs')!
  tabs.innerHTML = ''
  ;[{ label: 'Para você', following: false }, { label: 'Seguindo', following: true }].forEach(t => {
    const chip = document.createElement('button')
    chip.type = 'button'
    const active = t.following === onlyFollowing
    chip.className = `px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'}`
    chip.textContent = t.label
    chip.addEventListener('click', () => {
      if (onlyFollowing === t.following) return
      onlyFollowing = t.following
      buildTabs()
      loadFeedPosts()
    })
    tabs.appendChild(chip)
  })
}

function loadFeedPosts(): void {
  const container = document.getElementById('feed-list')!
  container.innerHTML = ''
  const spinner = document.createElement('div')
  spinner.className = 'flex justify-center py-8'
  spinner.appendChild(Spinner())
  container.appendChild(spinner)

  feedService.listPosts(1, undefined, onlyFollowing).then(posts => {
    spinner.remove()
    if (posts.length === 0) {
      return showEmpty(container, onlyFollowing
        ? 'Você ainda não segue nenhuma instituição (ou elas ainda não publicaram). Toque em "Seguir" no perfil de uma instituição.'
        : 'Ainda não há publicações. Volte em breve!')
    }
    posts.forEach(p => container.appendChild(PostCard(p, {
      onDeleted: () => { if (!container.querySelector('article')) showEmpty(container, 'Ainda não há publicações.') },
    })))
  }).catch(() => {
    spinner.remove()
    showEmpty(container, 'Não foi possível carregar o feed. Verifique sua conexão.')
  })
}

// experiência limitada da instituição em validação (spec 9.4): aviso fixo no topo do feed
function showInstitutionBanner(status: string): void {
  const text: Record<string, string> = {
    pending: '⏳ Sua instituição está em análise',
    needs_revision: '✏️ Sua instituição precisa de correções',
    rejected: '❌ Sua instituição não foi aprovada',
  }
  if (!text[status]) return
  const banner = document.createElement('button')
  banner.type = 'button'
  banner.className = `w-full mb-4 flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
    status === 'needs_revision' ? 'bg-blue-50 text-blue-700' : status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
  }`
  const label = document.createElement('span')
  label.textContent = text[status]
  const more = document.createElement('span')
  more.className = 'text-xs font-medium underline flex-shrink-0'
  more.textContent = 'Ver situação'
  banner.append(label, more)
  banner.addEventListener('click', () => { window.location.hash = '/institution-status' })
  document.getElementById('feed-list')?.before(banner)
}

function showEmpty(container: HTMLElement, text: string): void {
  const p = document.createElement('p')
  p.className = 'text-center text-gray-400 text-sm py-12'
  p.textContent = text
  container.appendChild(p)
}

let fabOpen = false

function buildFab(): void {
  const container = document.getElementById('fab-container')!
  container.innerHTML = ''

  const subActions = document.createElement('div')
  subActions.id = 'fab-actions'
  subActions.className = 'flex-col items-end gap-3'
  subActions.style.display = 'none'

  const options: Array<{ label: string; tipo: string; icon: string }> = [
    { label: 'Post', tipo: 'common', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' },
    { label: 'Evento', tipo: 'event', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' },
    { label: 'Campanha', tipo: 'campaign', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>' },
  ]
  options.forEach(o => {
    const row = document.createElement('div')
    row.className = 'flex items-center gap-2 pointer-events-auto'
    const text = document.createElement('span')
    text.className = 'bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow'
    text.textContent = o.label
    const btn = fabButton(o.icon, 'w-11 h-11', () => { closeFab(); window.location.hash = `/post/new?tipo=${o.tipo}` })
    btn.setAttribute('aria-label', `Criar ${o.label.toLowerCase()}`)
    row.append(text, btn)
    subActions.appendChild(row)
  })
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
  onlyFollowing = false
  document.getElementById('bottom-nav')?.remove()
}
