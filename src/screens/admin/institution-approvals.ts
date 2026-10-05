// src/screens/admin/institution-approvals.ts
import { Spinner, showToast } from '@/components'
import { adminService, authService } from '@/services'
import type { AdminInstitution, InstitutionStatus } from '@/types'

const TABS: Array<{ label: string; status: InstitutionStatus | 'all' }> = [
  { label: 'Pendentes', status: 'pending' },
  { label: 'Aprovadas', status: 'approved' },
  { label: 'Rejeitadas', status: 'rejected' },
  { label: 'Revisão', status: 'needs_revision' },
  { label: 'Todas', status: 'all' },
]

const STATUS_LABEL: Record<InstitutionStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  needs_revision: 'Revisão',
}

const STATUS_CLASS: Record<InstitutionStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
  needs_revision: 'bg-blue-50 text-blue-600',
}

let activeTab: InstitutionStatus | 'all' = 'pending'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Aprovação de Instituições</h1>
    </div>
    <div id="admin-guard-loading" class="flex justify-center py-16"></div>
    <div id="admin-content" class="hidden">
      <div id="status-tabs" class="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"></div>
      <div id="institutions-list" class="flex flex-col gap-3 px-4 pb-24"></div>
    </div>
    <div id="admin-denied" class="hidden text-center py-20 px-6">
      <p class="text-4xl mb-3">🔒</p>
      <p class="text-gray-700 font-semibold">Acesso restrito</p>
      <p class="text-gray-400 text-sm mt-1">Esta área é exclusiva para administradores e gestores.</p>
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
    if (user.role !== 'admin' && user.role !== 'gestor') {
      document.getElementById('admin-denied')!.classList.remove('hidden')
      return
    }
    document.getElementById('admin-content')!.classList.remove('hidden')
    buildTabs()
    loadInstitutions()
  }).catch(() => {
    loading.remove()
    document.getElementById('admin-denied')!.classList.remove('hidden')
  })
}

function buildTabs(): void {
  const container = document.getElementById('status-tabs')!
  container.innerHTML = ''
  TABS.forEach(tab => {
    const chip = document.createElement('button')
    const isActive = tab.status === activeTab
    chip.className = `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      isActive ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
    }`
    chip.textContent = tab.label
    chip.addEventListener('click', () => {
      activeTab = tab.status
      buildTabs()
      loadInstitutions()
    })
    container.appendChild(chip)
  })
}

function loadInstitutions(): void {
  const list = document.getElementById('institutions-list')!
  list.innerHTML = ''
  const spinnerWrapper = document.createElement('div')
  spinnerWrapper.className = 'flex justify-center py-8'
  spinnerWrapper.appendChild(Spinner())
  list.appendChild(spinnerWrapper)

  adminService.listInstitutions(activeTab === 'all' ? undefined : activeTab).then(institutions => {
    spinnerWrapper.remove()
    renderList(institutions)
  }).catch(() => {
    spinnerWrapper.remove()
    showToast('Erro ao carregar instituições', 'error')
  })
}

function renderList(institutions: AdminInstitution[]): void {
  const list = document.getElementById('institutions-list')!
  list.innerHTML = ''

  if (institutions.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text-center text-gray-400 py-12 text-sm'
    empty.textContent = 'Nenhuma instituição nesta categoria.'
    list.appendChild(empty)
    return
  }

  institutions.forEach(inst => list.appendChild(renderInstitutionCard(inst)))
}

function renderInstitutionCard(inst: AdminInstitution): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-4'

  const header = document.createElement('div')
  header.className = 'flex items-start justify-between gap-2'
  header.innerHTML = `
    <div class="min-w-0">
      <p class="font-bold text-gray-900 text-sm truncate">${inst.name}</p>
      <p class="text-xs text-gray-400 mt-0.5">${inst.category || 'Sem categoria'}${inst.city ? ` · ${inst.city}${inst.state ? `/${inst.state}` : ''}` : ''}</p>
    </div>
    <span class="flex-shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${STATUS_CLASS[inst.status]}">${STATUS_LABEL[inst.status]}</span>
  `
  card.appendChild(header)

  const responsible = document.createElement('div')
  responsible.className = 'mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500'
  responsible.innerHTML = `
    <p><span class="text-gray-400">Responsável:</span> ${inst.responsibleUserName || '—'}</p>
    <p class="truncate"><span class="text-gray-400">E-mail:</span> ${inst.responsibleUserEmail || '—'}</p>
    <p><span class="text-gray-400">Cadastrado em:</span> ${new Date(inst.createdAt).toLocaleDateString('pt-BR')}</p>
  `
  card.appendChild(responsible)

  if (inst.rejectionReason) {
    const reasonP = document.createElement('p')
    reasonP.className = 'mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-2 py-1.5'
    reasonP.textContent = `Motivo: ${inst.rejectionReason}`
    card.appendChild(reasonP)
  }

  if (inst.status === 'pending' || inst.status === 'needs_revision') {
    const actions = document.createElement('div')
    actions.className = 'flex gap-2 mt-3'

    const approveBtn = document.createElement('button')
    approveBtn.className = 'flex-1 py-2 rounded-xl bg-salvee-orange text-white text-xs font-semibold active:scale-95 transition-transform'
    approveBtn.textContent = 'Aprovar'
    approveBtn.addEventListener('click', () => updateStatus(inst.id, 'approved', undefined, card))

    const rejectBtn = document.createElement('button')
    rejectBtn.className = 'flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs font-semibold active:scale-95 transition-transform'
    rejectBtn.textContent = 'Rejeitar'
    rejectBtn.addEventListener('click', () => toggleRejectForm(card, inst.id))

    actions.appendChild(approveBtn)
    actions.appendChild(rejectBtn)
    card.appendChild(actions)
  }

  return card
}

function toggleRejectForm(card: HTMLElement, institutionId: string): void {
  const existing = card.querySelector('.reject-form')
  if (existing) { existing.remove(); return }

  const form = document.createElement('div')
  form.className = 'reject-form mt-3 flex flex-col gap-2'
  form.innerHTML = `
    <textarea class="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-red-300" rows="2" placeholder="Motivo da rejeição (opcional)"></textarea>
  `
  const confirmRow = document.createElement('div')
  confirmRow.className = 'flex gap-2'

  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold active:scale-95 transition-transform'
  confirmBtn.textContent = 'Confirmar rejeição'
  confirmBtn.addEventListener('click', () => {
    const reason = (form.querySelector('textarea') as HTMLTextAreaElement).value.trim()
    updateStatus(institutionId, 'rejected', reason || undefined, card)
  })

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold'
  cancelBtn.textContent = 'Cancelar'
  cancelBtn.addEventListener('click', () => form.remove())

  confirmRow.appendChild(confirmBtn)
  confirmRow.appendChild(cancelBtn)
  form.appendChild(confirmRow)
  card.appendChild(form)
}

async function updateStatus(institutionId: string, status: InstitutionStatus, reason: string | undefined, card: HTMLElement): Promise<void> {
  card.style.opacity = '0.5'
  card.style.pointerEvents = 'none'
  try {
    await adminService.updateInstitutionStatus(institutionId, status, reason)
    showToast(status === 'approved' ? 'Instituição aprovada' : 'Instituição rejeitada', 'success')
    loadInstitutions()
  } catch {
    card.style.opacity = '1'
    card.style.pointerEvents = 'auto'
    showToast('Erro ao atualizar status', 'error')
  }
}

export function unmount(): void {
  activeTab = 'pending'
}
