// src/screens/post-detail.ts — #/post/:id: publicação completa e comentários (spec 11.8 e 11.9)
import { Avatar, PostCard, Spinner, showToast } from '@/components'
import { feedService } from '@/services'
import { ApiError } from '@/services/api'
import type { Post, PostComment } from '@/types'

const MAX_COMMENT = 500
let postId = ''

export function render(params?: Record<string, string>): HTMLElement {
  postId = params?.id ?? ''
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Publicação</h1>
    </div>
    <div id="post-area" class="p-4"></div>
    <section class="px-4 pb-32">
      <h2 class="text-sm font-semibold text-gray-900 mb-3">Comentários</h2>
      <div id="comments" class="flex flex-col gap-3"></div>
    </section>
    <form id="comment-form" class="hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-3 pb-safe bg-white border-t border-gray-100 flex items-end gap-2">
      <textarea id="comment-input" rows="1" maxlength="${MAX_COMMENT}" placeholder="Escreva um comentário…"
        class="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm outline-none focus:border-salvee-orange resize-none max-h-32"></textarea>
      <button id="comment-send" type="submit" class="h-10 px-4 rounded-full bg-salvee-orange text-white text-sm font-semibold disabled:opacity-50">Enviar</button>
    </form>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const area = document.getElementById('post-area')!
  area.appendChild(Spinner())

  feedService.getPostById(postId).then(post => {
    area.innerHTML = ''
    const input = document.getElementById('comment-input') as HTMLTextAreaElement
    area.appendChild(PostCard(post, {
      detail: true,
      onCommentClick: () => input.focus(),
      onDeleted: () => history.back(),
    }))
    setupForm(post)
    loadComments()
  }).catch(err => {
    area.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'text-center text-gray-400 text-sm py-12'
    p.textContent = err instanceof ApiError && err.status === 404 ? 'Esta publicação não está mais disponível.' : 'Não foi possível carregar a publicação.'
    area.appendChild(p)
  })
}

function setupForm(post: Post): void {
  const form = document.getElementById('comment-form') as HTMLFormElement
  const input = document.getElementById('comment-input') as HTMLTextAreaElement
  const send = document.getElementById('comment-send') as HTMLButtonElement
  form.classList.remove('hidden')

  // cresce com o texto, até o limite do max-h
  input.addEventListener('input', () => {
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  })

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const content = input.value.trim()
    if (!content) return
    send.disabled = true
    try {
      const comment = await feedService.addComment(post.id, content)
      input.value = ''
      input.style.height = 'auto'
      const list = document.getElementById('comments')!
      list.querySelector('[data-role="empty"]')?.remove()
      list.appendChild(commentItem(comment))
      changeCount(+1)
      list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Não foi possível comentar', 'error')
    } finally {
      send.disabled = false
    }
  })
}

function loadComments(): void {
  const list = document.getElementById('comments')!
  list.appendChild(Spinner())
  feedService.listComments(postId).then(comments => {
    list.innerHTML = ''
    if (!comments.length) return showEmpty(list)
    comments.forEach(c => list.appendChild(commentItem(c)))
  }).catch(() => {
    list.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'text-gray-400 text-sm'
    p.textContent = 'Não foi possível carregar os comentários.'
    list.appendChild(p)
  })
}

function showEmpty(list: HTMLElement): void {
  const p = document.createElement('p')
  p.dataset['role'] = 'empty'
  p.className = 'text-gray-400 text-sm'
  p.textContent = 'Seja o primeiro a comentar.'
  list.appendChild(p)
}

// contador do balão no cartão acima
function changeCount(delta: number): void {
  const span = document.querySelector('#post-area [data-role="comment-count"]')
  if (span) span.textContent = String(Math.max(0, Number(span.textContent || 0) + delta))
}

function commentItem(c: PostComment): HTMLElement {
  const item = document.createElement('div')
  item.className = 'flex gap-3'
  item.appendChild(Avatar(c.userName, c.userAvatarUrl ?? undefined, 'sm'))

  const body = document.createElement('div')
  body.className = 'flex-1 min-w-0 bg-gray-50 rounded-2xl px-3 py-2'
  const head = document.createElement('div')
  head.className = 'flex items-center gap-2'
  const name = document.createElement('span')
  name.className = 'text-xs font-semibold text-gray-900 truncate'
  name.textContent = c.userName
  const time = document.createElement('span')
  time.className = 'text-[11px] text-gray-400'
  time.textContent = new Date(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  head.append(name, time)

  if (c.canDelete) {
    const del = document.createElement('button')
    del.type = 'button'
    del.className = 'ml-auto text-[11px] text-red-400 hover:text-red-600'
    del.textContent = 'Apagar'
    del.addEventListener('click', async () => {
      // segundo toque confirma
      if (del.dataset['confirm'] !== '1') {
        del.dataset['confirm'] = '1'
        del.textContent = 'Confirmar?'
        return
      }
      try {
        await feedService.deleteComment(c.id)
        const list = item.parentElement!
        item.remove()
        changeCount(-1)
        if (!list.children.length) showEmpty(list)
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Não foi possível apagar', 'error')
      }
    })
    head.appendChild(del)
  }

  const text = document.createElement('p')
  text.className = 'text-sm text-gray-700 whitespace-pre-line break-words mt-0.5'
  text.textContent = c.content
  body.append(head, text)
  item.appendChild(body)
  return item
}

export function unmount(): void {
  postId = ''
}
