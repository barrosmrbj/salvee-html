// src/screens/admin/user-management.ts
import { Spinner, showToast } from '@/components'
import { adminService, authService } from '@/services'
import type { AdminUser } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  user: 'Usuário',
  gestor: 'Gestor',
  admin: 'Admin',
}

const ROLE_CLASS: Record<string, string> = {
  user: 'bg-gray-100 text-gray-500',
  gestor: 'bg-salvee-orange-bg text-salvee-orange',
  admin: 'bg-gray-900 text-white',
}

let searchTimeout: ReturnType<typeof setTimeout>
let currentMode: { name?: string; role?: 'gestor' } | null = null

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Gerenciar Usuários</h1>
    </div>
    <div id="admin-guard-loading" class="flex justify-center py-16"></div>
    <div id="admin-content" class="hidden">
      <div class="px-4 py-3 flex flex-col gap-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="user-search" type="search" placeholder="Buscar por nome" class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:border-salvee-orange transition-colors" />
        </div>
        <button id="show-gestores-btn" class="self-start px-3 py-1.5 rounded-full text-xs font-semibold border border-salvee-orange/40 text-salvee-orange bg-white transition-colors">Ver gestores atuais</button>
      </div>
      <div id="users-list" class="flex flex-col gap-3 px-4 pb-24"></div>
    </div>
    <div id="admin-denied" class="hidden text-center py-20 px-6">
      <p class="text-4xl mb-3">🔒</p>
      <p class="text-gray-700 font-semibold">Acesso restrito</p>
      <p class="text-gray-400 text-sm mt-1">Esta área é exclusiva para administradores.</p>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())

  const loading = document.getElementById('admin-guard-loading')!
  loading.appendChild(Spinner())

  authService.getMe().then(user => {
    loading.remove()
    if (user.role !== 'admin') {
      document.getElementById('admin-denied')!.classList.remove('hidden')
      return
    }
    document.getElementById('admin-content')!.classList.remove('hidden')
    showSearchPrompt()

    document.getElementById('user-search')!.addEventListener('input', (e) => {
      clearTimeout(searchTimeout)
      const q = (e.target as HTMLInputElement).value.trim()
      if (!q) { currentMode = null; showSearchPrompt(); return }
      searchTimeout = setTimeout(() => loadUsers({ name: q }), 400)
    })

    document.getElementById('show-gestores-btn')!.addEventListener('click', () => {
      ;(document.getElementById('user-search') as HTMLInputElement).value = ''
      loadUsers({ role: 'gestor' })
    })
  }).catch(() => {
    loading.remove()
    document.getElementById('admin-denied')!.classList.remove('hidden')
  })
}

function showSearchPrompt(): void {
  const list = document.getElementById('users-list')!
  list.innerHTML = '<p class="text-center text-gray-400 py-12 text-sm">Digite um nome para buscar usuários.</p>'
}

function loadUsers(mode: { name?: string; role?: 'gestor' }): void {
  currentMode = mode
  const list = document.getElementById('users-list')!
  list.innerHTML = ''
  const spinnerWrapper = document.createElement('div')
  spinnerWrapper.className = 'flex justify-center py-8'
  spinnerWrapper.appendChild(Spinner())
  list.appendChild(spinnerWrapper)

  adminService.listUsers(mode).then(users => {
    spinnerWrapper.remove()
    renderList(users, mode.role === 'gestor' ? 'Nenhum gestor cadastrado ainda.' : undefined)
  }).catch(() => {
    spinnerWrapper.remove()
    showToast('Erro ao carregar usuários', 'error')
  })
}

function renderList(users: AdminUser[], emptyMessage = 'Nenhum usuário encontrado.'): void {
  const list = document.getElementById('users-list')!
  list.innerHTML = ''

  if (users.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text-center text-gray-400 py-12 text-sm'
    empty.textContent = emptyMessage
    list.appendChild(empty)
    return
  }

  users.forEach(user => list.appendChild(renderUserCard(user)))
}

function renderUserCard(user: AdminUser): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3'

  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0'
  info.innerHTML = `
    <div class="flex items-center gap-2">
      <p class="font-semibold text-gray-900 text-sm truncate">${user.name}</p>
      <span class="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_CLASS[user.role] ?? ROLE_CLASS.user}">${ROLE_LABEL[user.role] ?? user.role}</span>
    </div>
    <p class="text-xs text-gray-400 truncate mt-0.5">${user.email}</p>
  `
  card.appendChild(info)

  if (user.role === 'user' || user.role === 'gestor') {
    const actionBtn = document.createElement('button')
    const promoting = user.role === 'user'
    actionBtn.className = promoting
      ? 'flex-shrink-0 px-3 py-2 rounded-xl bg-salvee-orange text-white text-xs font-semibold active:scale-95 transition-transform'
      : 'flex-shrink-0 px-3 py-2 rounded-xl border border-red-300 text-red-500 text-xs font-semibold active:scale-95 transition-transform'
    actionBtn.textContent = promoting ? 'Tornar gestor' : 'Remover gestor'
    actionBtn.addEventListener('click', () => updateRole(user.id, promoting ? 'gestor' : 'user', card))
    card.appendChild(actionBtn)
  }

  return card
}

async function updateRole(userId: string, role: 'user' | 'gestor', card: HTMLElement): Promise<void> {
  card.style.opacity = '0.5'
  card.style.pointerEvents = 'none'
  try {
    await adminService.updateUserRole(userId, role)
    showToast(role === 'gestor' ? 'Usuário promovido a gestor' : 'Gestor removido', 'success')
    if (currentMode) loadUsers(currentMode)
  } catch {
    card.style.opacity = '1'
    card.style.pointerEvents = 'auto'
    showToast('Erro ao atualizar usuário', 'error')
  }
}

export function unmount(): void {
  clearTimeout(searchTimeout)
  currentMode = null
}
