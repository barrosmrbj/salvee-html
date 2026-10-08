// Cartão de publicação do feed e do mural da instituição (spec 11.7 e 11.8).
// Botão conforme o tipo: campanha → Doar (destaque), evento → Participar, comum → Ajudar.
// Quem é responsável pela instituição (post.canEdit) vê Editar/Excluir.
import { Avatar } from './Avatar'
import { VerifiedBadge } from './Badge'
import { ProgressBar } from './ProgressBar'
import { showToast } from './Toast'
import { calendarService, feedService } from '@/services'
import { ApiError } from '@/services/api'
import type { Post } from '@/types'

export interface PostCardOptions {
  /** chamado depois de excluir, para a tela tirar o cartão da lista */
  onDeleted?: (post: Post) => void
}

const TYPE_TAG: Record<string, { label: string; className: string } | undefined> = {
  event: { label: '📅 Evento', className: 'bg-blue-50 text-blue-600' },
  campaign: { label: '🎯 Campanha', className: 'bg-salvee-orange-bg text-salvee-orange' },
}

export function PostCard(post: Post, options: PostCardOptions = {}): HTMLElement {
  const card = document.createElement('article')
  card.className = 'bg-gray-50 rounded-2xl p-4 flex flex-col gap-3'
  const goToInstitution = () => { window.location.hash = `/institution/${post.institutionId}` }

  // cabeçalho: instituição, selo, tempo e menu do autor
  const header = document.createElement('div')
  header.className = 'flex items-center gap-3'
  const who = document.createElement('button')
  who.type = 'button'
  who.className = 'flex items-center gap-2 min-w-0 text-left'
  who.appendChild(Avatar(post.institutionName ?? 'Inst', post.institutionLogoUrl, 'sm'))
  const name = document.createElement('span')
  name.className = 'font-semibold text-gray-900 text-sm truncate'
  name.textContent = post.institutionName ?? ''
  who.appendChild(name)
  if (post.institutionVerified) who.appendChild(VerifiedBadge())
  who.addEventListener('click', goToInstitution)
  header.appendChild(who)

  const time = document.createElement('span')
  time.className = 'ml-auto text-xs text-gray-400 flex-shrink-0'
  time.textContent = formatRelative(post.createdAt)
  header.appendChild(time)
  if (post.canEdit) header.appendChild(authorMenu(post, card, options))
  card.appendChild(header)

  const tag = TYPE_TAG[post.type]
  if (tag) {
    const pill = document.createElement('span')
    pill.className = `self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${tag.className}`
    pill.textContent = tag.label
    card.appendChild(pill)
  }

  if (post.title) {
    const title = document.createElement('h3')
    title.className = 'font-bold text-gray-900'
    title.textContent = post.title
    card.appendChild(title)
  }

  const content = document.createElement('p')
  content.className = 'text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-6'
  content.textContent = post.content
  card.appendChild(content)

  const images = post.images?.length ? post.images : (post.imageUrl ? [post.imageUrl] : [])
  if (images.length) card.appendChild(imageGallery(images))

  if (post.type === 'campaign' && post.campaignGoal) {
    card.appendChild(ProgressBar(post.campaignCurrent ?? 0, post.campaignGoal))
    if (post.campaignDeadline) card.appendChild(infoLine('⏳', `Até ${formatDate(post.campaignDeadline)}`))
  }

  if (post.type === 'event') {
    if (post.eventDate) card.appendChild(infoLine('🗓️', formatDateTime(post.eventDate)))
    if (post.eventLocation) card.appendChild(infoLine('📍', post.eventLocation))
    if (post.eventInstructions) card.appendChild(infoLine('ℹ️', post.eventInstructions))
  }

  card.appendChild(actionButton(post, goToInstitution))
  return card
}

function actionButton(post: Post, goToInstitution: () => void): HTMLElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  const base = 'w-full py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform'

  if (post.type === 'campaign') {
    btn.className = `${base} bg-salvee-orange text-white shadow-sm`
    btn.textContent = 'Doar'
    btn.addEventListener('click', () => {
      window.location.hash = `/donate/${post.institutionId}?campanha=${encodeURIComponent(post.id)}`
    })
    return btn
  }

  if (post.type === 'event') {
    let registered = Boolean(post.registered)
    const paint = () => {
      btn.className = registered
        ? `${base} bg-green-50 text-green-700 border border-green-200`
        : `${base} bg-white text-salvee-orange border border-salvee-orange`
      btn.textContent = registered ? '✓ Participando' : 'Participar'
    }
    paint()
    btn.addEventListener('click', async () => {
      btn.disabled = true
      try {
        if (registered) {
          await calendarService.unregisterFromEvent(post.id)
          registered = false
          showToast('Participação cancelada', 'info')
        } else {
          await calendarService.registerForEvent(post.id)
          registered = true
          showToast('Evento adicionado à sua agenda', 'success')
        }
        paint()
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Não foi possível atualizar', 'error')
      } finally {
        btn.disabled = false
      }
    })
    return btn
  }

  btn.className = `${base} bg-white text-gray-700 border border-gray-200`
  btn.textContent = 'Ajudar'
  btn.addEventListener('click', goToInstitution)
  return btn
}

function authorMenu(post: Post, card: HTMLElement, options: PostCardOptions): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'relative flex-shrink-0'
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full'
  toggle.setAttribute('aria-label', 'Opções da publicação')
  toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'
  const menu = document.createElement('div')
  menu.className = 'hidden absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40'

  const item = (label: string, className: string, onClick: () => void) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = `w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${className}`
    b.textContent = label
    b.addEventListener('click', onClick)
    menu.appendChild(b)
    return b
  }
  item('Editar', 'text-gray-700', () => { window.location.hash = `/post/${post.id}/edit` })
  const del = item('Excluir', 'text-red-500', async () => {
    // segundo toque confirma (sem diálogo do navegador)
    if (del.dataset['confirm'] !== '1') {
      del.dataset['confirm'] = '1'
      del.textContent = 'Toque de novo para excluir'
      return
    }
    try {
      await feedService.deletePost(post.id)
      showToast('Publicação excluída', 'success')
      card.remove()
      options.onDeleted?.(post)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao excluir', 'error')
    }
  })

  toggle.addEventListener('click', () => menu.classList.toggle('hidden'))
  wrap.appendChild(toggle)
  wrap.appendChild(menu)
  return wrap
}

function imageGallery(images: string[]): HTMLElement {
  if (images.length === 1) {
    const img = document.createElement('img')
    img.src = images[0]
    img.alt = ''
    img.loading = 'lazy'
    img.className = 'w-full max-h-80 object-cover rounded-xl bg-gray-100'
    return img
  }
  // carrossel com rolagem lateral (spec 11.6)
  const strip = document.createElement('div')
  strip.className = 'flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1 px-1'
  images.forEach((src, i) => {
    const frame = document.createElement('div')
    frame.className = 'relative flex-shrink-0 w-[85%] snap-center'
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.loading = 'lazy'
    img.className = 'w-full h-56 object-cover rounded-xl bg-gray-100'
    const count = document.createElement('span')
    count.className = 'absolute top-2 right-2 text-[11px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full'
    count.textContent = `${i + 1}/${images.length}`
    frame.appendChild(img)
    frame.appendChild(count)
    strip.appendChild(frame)
  })
  return strip
}

function infoLine(icon: string, text: string): HTMLElement {
  const p = document.createElement('p')
  p.className = 'text-xs text-gray-500 flex gap-2'
  const i = document.createElement('span')
  i.textContent = icon
  const t = document.createElement('span')
  t.textContent = text
  p.appendChild(i)
  p.appendChild(t)
  return p
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

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
