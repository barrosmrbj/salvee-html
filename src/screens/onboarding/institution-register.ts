import { Button, Input, showToast, LoadingOverlay } from '@/components'
import { institutionService, authService } from '@/services'
import { ApiError } from '@/services/api'

const TOTAL_STEPS = 3
const STEP_TITLES = ['Identificação', 'Localização & Missão', 'Identidade Visual']
const CATEGORIES = ['Saúde', 'Crianças', 'Idosos', 'Educação', 'Animais', 'Outros']
const SESSION_KEY = 'salvee_inst_id'

let currentStep = 1
let prefillData: { name?: string; email?: string; phone?: string } = {}

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600 flex-shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="flex-1">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span id="step-label">Etapa 1 de ${TOTAL_STEPS}</span>
          <span id="step-title" class="font-medium text-gray-600">${STEP_TITLES[0]}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div id="step-bar" class="bg-salvee-orange h-1.5 rounded-full transition-all duration-300" style="width:${(1/TOTAL_STEPS)*100}%"></div>
        </div>
      </div>
    </div>
    <div id="step-content" class="overflow-y-auto p-6 pb-32 flex flex-col gap-4"></div>
    <div id="step-actions" class="fixed bottom-0 left-0 right-0 max-w-app mx-auto p-4 pb-safe bg-white border-t border-gray-100 flex flex-col gap-2"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; renderStep() }
    else history.back()
  })

  authService.getMe().then(user => {
    prefillData = { name: user.name, email: user.email, phone: (user as { phone?: string }).phone ?? '' }
    renderStep()
  }).catch(() => renderStep())
}

function updateProgress(): void {
  document.getElementById('step-label')!.textContent = `Etapa ${currentStep} de ${TOTAL_STEPS}`
  document.getElementById('step-title')!.textContent = STEP_TITLES[currentStep - 1]
  ;(document.getElementById('step-bar') as HTMLElement).style.width = `${(currentStep / TOTAL_STEPS) * 100}%`
}

function renderStep(): void {
  updateProgress()
  const content = document.getElementById('step-content')!
  const actions = document.getElementById('step-actions')!
  content.innerHTML = ''
  actions.innerHTML = ''

  if (currentStep === 1) renderStep1(content)
  else if (currentStep === 2) renderStep2(content)
  else renderStep3(content)

  const isLast = currentStep === TOTAL_STEPS

  actions.appendChild(Button({
    label: isLast ? 'Enviar para análise' : 'Avançar',
    variant: 'primary',
    fullWidth: true,
    onClick: () => void handleAdvance(),
  }))

  if (currentStep > 1) {
    actions.appendChild(Button({
      label: 'Pular esta etapa',
      variant: 'ghost',
      fullWidth: true,
      onClick: () => void handleSkip(),
    }))
  }
}

// ── Etapa 1: Identificação ────────────────────────────────────────────────────
function renderStep1(container: HTMLElement): void {
  const intro = document.createElement('div')
  intro.className = 'mb-2'
  intro.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900">Quem é você?</h2>
    <p class="text-sm text-gray-500 mt-1">Informe os dados básicos da sua instituição.</p>
  `
  container.appendChild(intro)

  appendInput(container, { id: 'name', label: 'Nome da instituição', placeholder: 'Nome oficial', required: true })
  appendInput(container, { id: 'responsible', label: 'Nome do responsável', placeholder: 'Seu nome completo', required: true, prefill: prefillData.name })
  appendInput(container, { id: 'contact_email', label: 'E-mail de contato', type: 'email', placeholder: 'contato@ong.org', required: true, prefill: prefillData.email })
  appendInput(container, { id: 'contact_phone', label: 'Telefone', type: 'tel', placeholder: '(92) 99999-9999', required: true, prefill: prefillData.phone })

  // Category select
  const catWrapper = document.createElement('div')
  catWrapper.className = 'flex flex-col gap-1'
  catWrapper.innerHTML = `
    <label class="text-sm font-medium text-gray-700">Categoria <span class="text-red-500">*</span></label>
    <select id="category" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm outline-none focus:border-salvee-orange bg-white">
      <option value="">Selecione uma categoria</option>
      ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
    </select>
    <span id="category-error" class="text-xs text-red-500 hidden">Selecione uma categoria</span>
  `
  container.appendChild(catWrapper)

  appendInput(container, { id: 'subcategory', label: 'Subcategoria (opcional)', placeholder: 'Ex: Abrigo, Alimentação' })
}

// ── Etapa 2: Localização & Missão ────────────────────────────────────────────
function renderStep2(container: HTMLElement): void {
  const intro = document.createElement('div')
  intro.className = 'mb-2'
  intro.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900">Onde e o quê?</h2>
    <p class="text-sm text-gray-500 mt-1">Localização e missão da instituição.</p>
  `
  container.appendChild(intro)

  appendTextarea(container, { id: 'description', label: 'Descrição curta', placeholder: 'Descreva em até 200 caracteres o que vocês fazem.', maxLength: 200, required: true })
  appendInput(container, { id: 'audience', label: 'Público atendido (opcional)', placeholder: 'Ex: Crianças de 5 a 12 anos' })
  appendInput(container, { id: 'cnpj', label: 'CNPJ (opcional)', placeholder: '00.000.000/0000-00' })
  appendInput(container, { id: 'street', label: 'Endereço (opcional)', placeholder: 'Rua das Flores, 123' })
  appendInput(container, { id: 'zip', label: 'CEP (opcional)', placeholder: '69000-000' })
  appendTextarea(container, { id: 'mission', label: 'Missão (opcional)', placeholder: 'Nossa missão é...' })
  appendInput(container, { id: 'founded_year', label: 'Ano de fundação (opcional)', type: 'number', placeholder: '2010' })
}

// ── Etapa 3: Identidade Visual & Documentos ──────────────────────────────────
function renderStep3(container: HTMLElement): void {
  const intro = document.createElement('div')
  intro.className = 'mb-2'
  intro.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900">Identidade Visual</h2>
    <p class="text-sm text-gray-500 mt-1">Fotos e documentos para validação. <span class="text-gray-400">(opcional)</span></p>
  `
  container.appendChild(intro)

  appendFileInput(container, { id: 'logo', label: 'Logo da instituição', hint: 'JPG ou PNG · máx. 1 MB' })
  appendFileInput(container, { id: 'photo', label: 'Foto principal do local', hint: 'JPG ou PNG · máx. 1 MB' })
  appendTextarea(container, { id: 'history', label: 'História (opcional)', placeholder: 'Conte como a instituição surgiu...' })
  appendFileInput(container, { id: 'docs', label: 'Documentos para análise', hint: 'PDF, JPG ou PNG · máx. 1 MB', accept: '.pdf,image/jpeg,image/png' })
}

// ── Helpers de campo ─────────────────────────────────────────────────────────

function appendInput(container: HTMLElement, opts: { id: string; label: string; type?: string; placeholder?: string; required?: boolean; prefill?: string }): void {
  const w = document.createElement('div')
  w.appendChild(Input({ id: opts.id, label: opts.label, type: opts.type, placeholder: opts.placeholder, required: opts.required }))

  const inp = w.querySelector('input') as HTMLInputElement
  if (opts.prefill && inp) inp.value = opts.prefill

  if (opts.required && inp) {
    inp.addEventListener('blur', () => validateRequired(inp))
  }
  container.appendChild(w)
}

function appendTextarea(container: HTMLElement, opts: { id: string; label: string; placeholder?: string; maxLength?: number; required?: boolean }): void {
  const w = document.createElement('div')
  w.className = 'flex flex-col gap-1'

  const label = document.createElement('label')
  label.htmlFor = opts.id
  label.className = 'text-sm font-medium text-gray-700'
  label.innerHTML = opts.label + (opts.required ? ' <span class="text-red-500">*</span>' : '')
  w.appendChild(label)

  const ta = document.createElement('textarea')
  ta.id = opts.id
  ta.placeholder = opts.placeholder ?? ''
  ta.rows = 3
  if (opts.maxLength) ta.maxLength = opts.maxLength
  ta.className = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm resize-none outline-none focus:border-salvee-orange'

  if (opts.maxLength) {
    const counter = document.createElement('span')
    counter.className = 'text-xs text-gray-400 text-right'
    counter.textContent = `0/${opts.maxLength}`
    ta.addEventListener('input', () => { counter.textContent = `${ta.value.length}/${opts.maxLength}` })
    w.appendChild(ta)
    w.appendChild(counter)
  } else {
    w.appendChild(ta)
  }

  const errSpan = document.createElement('span')
  errSpan.id = `${opts.id}-error`
  errSpan.className = 'text-xs text-red-500 hidden'
  errSpan.textContent = 'Campo obrigatório'
  w.appendChild(errSpan)

  if (opts.required) ta.addEventListener('blur', () => validateRequired(ta))
  container.appendChild(w)
}

function appendFileInput(container: HTMLElement, opts: { id: string; label: string; hint: string; accept?: string }): void {
  const accept = opts.accept ?? 'image/jpeg,image/png'
  const w = document.createElement('div')
  w.className = 'flex flex-col gap-1'
  w.innerHTML = `
    <label class="text-sm font-medium text-gray-700">${opts.label}</label>
    <label for="${opts.id}-file" class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-salvee-orange transition-colors">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <div class="flex-1 min-w-0">
        <span id="${opts.id}-name" class="text-sm text-gray-400 truncate block">Escolher arquivo</span>
        <span class="text-xs text-gray-300">${opts.hint}</span>
      </div>
    </label>
    <input type="file" id="${opts.id}-file" accept="${accept}" class="hidden" />
    <span id="${opts.id}-error" class="text-xs text-red-500 hidden"></span>
    <div id="${opts.id}-preview" class="hidden mt-1"></div>
  `

  const fileInput = w.querySelector(`#${opts.id}-file`) as HTMLInputElement
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (!file) return

    const errEl = w.querySelector(`#${opts.id}-error`) as HTMLElement
    if (file.size > 1_048_576) {
      errEl.textContent = 'Arquivo muito grande. Máximo: 1 MB.'
      errEl.classList.remove('hidden')
      fileInput.value = ''
      return
    }
    errEl.classList.add('hidden')
    ;(w.querySelector(`#${opts.id}-name`) as HTMLElement).textContent = file.name

    if (file.type.startsWith('image/')) {
      const preview = w.querySelector(`#${opts.id}-preview`) as HTMLElement
      const reader = new FileReader()
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target?.result as string}" alt="preview" class="w-24 h-24 object-cover rounded-xl border border-gray-200" />`
        preview.classList.remove('hidden')
      }
      reader.readAsDataURL(file)
    }
  })

  container.appendChild(w)
}

function validateRequired(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  const errId = `${el.id}-error`
  const errEl = document.getElementById(errId)
  if (!el.value.trim()) {
    el.classList.add('border-red-400')
    errEl?.classList.remove('hidden')
    return false
  }
  el.classList.remove('border-red-400')
  errEl?.classList.add('hidden')
  return true
}

// ── Submit logic ─────────────────────────────────────────────────────────────

async function handleSkip(): Promise<void> {
  if (currentStep < TOTAL_STEPS) { currentStep++; renderStep() }
  else finish()
}

async function handleAdvance(): Promise<void> {
  if (!validateStep()) return

  const overlay = LoadingOverlay()
  document.body.appendChild(overlay)
  try {
    if (currentStep === 1) await submitStep1()
    else if (currentStep === 2) await submitStep2()
    else await submitStep3()

    if (currentStep < TOTAL_STEPS) {
      currentStep++
      renderStep()
    } else {
      finish()
    }
  } catch (err) {
    showToast(err instanceof ApiError ? err.message : 'Erro ao salvar. Tente novamente.', 'error')
  } finally {
    overlay.remove()
  }
}

function validateStep(): boolean {
  if (currentStep === 1) {
    const ids = ['name', 'responsible', 'contact_email', 'contact_phone']
    const allValid = ids.map(id => {
      const el = document.getElementById(id) as HTMLInputElement
      return el ? validateRequired(el) : true
    }).every(Boolean)

    const cat = document.getElementById('category') as HTMLSelectElement
    const catErr = document.getElementById('category-error')!
    if (!cat?.value) { catErr.classList.remove('hidden'); return false }
    catErr.classList.add('hidden')
    return allValid
  }
  if (currentStep === 2) {
    const el = document.getElementById('description') as HTMLTextAreaElement
    return el ? validateRequired(el) : true
  }
  return true
}

async function submitStep1(): Promise<void> {
  const data: Record<string, string> = {}
  ;['name', 'responsible', 'contact_email', 'contact_phone', 'category', 'subcategory'].forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement
    if (el?.value) data[id] = el.value
  })
  const instId = sessionStorage.getItem(SESSION_KEY) ?? undefined
  const res = await institutionService.registerStep({ step: 1, data, institutionId: instId })
  sessionStorage.setItem(SESSION_KEY, res.institutionId)
}

async function submitStep2(): Promise<void> {
  const data: Record<string, string> = {}
  ;['description', 'audience', 'cnpj', 'street', 'zip', 'mission', 'founded_year'].forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement
    if (el?.value) data[id] = el.value
  })
  const instId = sessionStorage.getItem(SESSION_KEY) ?? undefined
  await institutionService.registerStep({ step: 2, data, institutionId: instId })
}

async function submitStep3(): Promise<void> {
  const data: Record<string, string> = {}

  const historyEl = document.getElementById('history') as HTMLTextAreaElement
  if (historyEl?.value) data['history'] = historyEl.value

  for (const id of ['logo', 'photo']) {
    const fileInput = document.getElementById(`${id}-file`) as HTMLInputElement
    const file = fileInput?.files?.[0]
    if (file) {
      const url = await institutionService.uploadFile(file)
      data[id === 'logo' ? 'logo_url' : 'photo_url'] = url
    }
  }

  // upload docs separately (no URL storage needed for analysis)
  const docsInput = document.getElementById('docs-file') as HTMLInputElement
  if (docsInput?.files?.[0]) {
    await institutionService.uploadFile(docsInput.files[0])
  }

  const instId = sessionStorage.getItem(SESSION_KEY) ?? undefined
  await institutionService.registerStep({ step: 3, data, institutionId: instId })
}

function finish(): void {
  sessionStorage.removeItem(SESSION_KEY)
  showToast('Cadastro enviado para análise!', 'success')
  setTimeout(() => { window.location.hash = '/feed' }, 1800)
}

export function unmount(): void {
  currentStep = 1
  prefillData = {}
}
