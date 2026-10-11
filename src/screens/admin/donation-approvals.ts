// src/screens/admin/donation-approvals.ts
import { Spinner, showToast } from '@/components'
import { adminService, authService } from '@/services'
import type { AdminDonation, DonationStatus } from '@/types'

const TABS: Array<{ label: string; status: DonationStatus | 'all' }> = [
  { label: 'Pendentes', status: 'pending' },
  { label: 'Confirmadas', status: 'confirmed' },
  { label: 'Canceladas', status: 'cancelled' },
  { label: 'Todas', status: 'all' },
]

const STATUS_LABEL: Record<DonationStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_CLASS: Record<DonationStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

let activeTab: DonationStatus | 'all' = 'pending'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Confirmação de Doações</h1>
    </div>
    <div id="admin-guard-loading" class="flex justify-center py-16"></div>
    <div id="admin-content" class="hidden">
      <p class="px-4 pt-3 text-xs text-gray-400">Confirme só depois de ver o pagamento recebido. Ao confirmar, o doador recebe os XP e Salves.</p>
      <div id="status-tabs" class="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"></div>
      <div id="donations-list" class="flex flex-col gap-3 px-4 pb-24"></div>
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
    loadDonations()
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
      loadDonations()
    })
    container.appendChild(chip)
  })
}

function loadDonations(): void {
  const list = document.getElementById('donations-list')!
  list.innerHTML = ''
  const spinnerWrapper = document.createElement('div')
  spinnerWrapper.className = 'flex justify-center py-8'
  spinnerWrapper.appendChild(Spinner())
  list.appendChild(spinnerWrapper)

  adminService.listDonations(activeTab === 'all' ? undefined : activeTab).then(donations => {
    spinnerWrapper.remove()
    renderList(donations)
  }).catch(() => {
    spinnerWrapper.remove()
    showToast('Erro ao carregar doações', 'error')
  })
}

function renderList(donations: AdminDonation[]): void {
  const list = document.getElementById('donations-list')!
  list.innerHTML = ''

  if (donations.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text-center text-gray-400 py-12 text-sm'
    empty.textContent = 'Nenhuma doação nesta categoria.'
    list.appendChild(empty)
    return
  }

  donations.forEach(d => list.appendChild(renderDonationCard(d)))
}

// textos do usuário entram por textContent (nunca innerHTML)
function line(className: string, text: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = className
  p.textContent = text
  return p
}

function renderDonationCard(d: AdminDonation): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-4'

  const header = document.createElement('div')
  header.className = 'flex items-start justify-between gap-2'
  const titleBox = document.createElement('div')
  titleBox.className = 'min-w-0'
  titleBox.appendChild(line('font-bold text-gray-900 text-base', `R$ ${d.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`))
  titleBox.appendChild(line('text-xs text-gray-500 mt-0.5 truncate', `para ${d.institutionName}`))
  const badge = document.createElement('span')
  badge.className = `flex-shrink-0 text-[0.6875rem] font-semibold px-2 py-1 rounded-full ${STATUS_CLASS[d.status]}`
  badge.textContent = STATUS_LABEL[d.status]
  header.appendChild(titleBox)
  header.appendChild(badge)
  card.appendChild(header)

  const info = document.createElement('div')
  info.className = 'mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 flex flex-col gap-0.5'
  info.appendChild(line('', `Doador: ${d.userName || '—'}${d.anonymous ? ' (anônima)' : ''}`))
  info.appendChild(line('truncate', `E-mail: ${d.userEmail || '—'}`))
  info.appendChild(line('', `Pagamento: ${d.paymentMethod.toUpperCase()} · ${new Date(d.createdAt).toLocaleString('pt-BR')}`))
  info.appendChild(line('text-salvee-orange font-medium', `+${d.xpEarned} XP · +${d.salvesEarned} SLV`))
  if (d.message) info.appendChild(line('italic text-gray-400', `"${d.message}"`))
  card.appendChild(info)

  if (d.status === 'pending') {
    const actions = document.createElement('div')
    actions.className = 'flex gap-2 mt-3'

    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'flex-1 py-2 rounded-xl bg-salvee-orange text-white text-xs font-semibold active:scale-95 transition-transform'
    confirmBtn.textContent = 'Confirmar pagamento'
    confirmBtn.addEventListener('click', () => updateStatus(d.id, 'confirmed', card))

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs font-semibold active:scale-95 transition-transform'
    cancelBtn.textContent = 'Cancelar'
    cancelBtn.addEventListener('click', () => toggleCancelConfirm(card, d.id))

    actions.appendChild(confirmBtn)
    actions.appendChild(cancelBtn)
    card.appendChild(actions)
  }

  return card
}

function toggleCancelConfirm(card: HTMLElement, donationId: string): void {
  const existing = card.querySelector('.cancel-confirm')
  if (existing) { existing.remove(); return }

  const box = document.createElement('div')
  box.className = 'cancel-confirm mt-3 flex flex-col gap-2'
  box.appendChild(line('text-xs text-red-500', 'Cancelar esta doação? O doador não recebe pontos e não dá para desfazer.'))

  const row = document.createElement('div')
  row.className = 'flex gap-2'
  const yesBtn = document.createElement('button')
  yesBtn.className = 'flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold active:scale-95 transition-transform'
  yesBtn.textContent = 'Sim, cancelar'
  yesBtn.addEventListener('click', () => updateStatus(donationId, 'cancelled', card))
  const noBtn = document.createElement('button')
  noBtn.className = 'flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold'
  noBtn.textContent = 'Voltar'
  noBtn.addEventListener('click', () => box.remove())
  row.appendChild(yesBtn)
  row.appendChild(noBtn)
  box.appendChild(row)
  card.appendChild(box)
}

async function updateStatus(donationId: string, status: 'confirmed' | 'cancelled', card: HTMLElement): Promise<void> {
  card.style.opacity = '0.5'
  card.style.pointerEvents = 'none'
  try {
    await adminService.updateDonationStatus(donationId, status)
    showToast(status === 'confirmed' ? 'Doação confirmada, pontos creditados' : 'Doação cancelada', 'success')
    loadDonations()
  } catch (err) {
    card.style.opacity = '1'
    card.style.pointerEvents = 'auto'
    showToast(err instanceof Error && err.message ? err.message : 'Erro ao atualizar a doação', 'error')
  }
}

export function unmount(): void {
  activeTab = 'pending'
}
