import { Button, Input, showToast, LoadingOverlay } from '@/components'
import { institutionService } from '@/services'
import { ApiError } from '@/services/api'

const TOTAL_STEPS = 6
let currentStep = 1

const stepTitles = ['Identificação', 'Dados Formais', 'Atuação', 'Visual', 'Histórico', 'Documentação']

type FieldDef = { id: string; label: string; type?: string; placeholder?: string }

const stepFields: Record<number, FieldDef[]> = {
  1: [
    { id: 'name', label: 'Nome da instituição', placeholder: 'Nome oficial' },
    { id: 'responsible', label: 'Responsável', placeholder: 'Nome do responsável' },
    { id: 'contact_email', label: 'E-mail de contato', type: 'email', placeholder: 'contato@ong.org' },
    { id: 'contact_phone', label: 'Telefone', type: 'tel', placeholder: '(92) 99999-9999' },
  ],
  2: [
    { id: 'cnpj', label: 'CNPJ (se houver)', placeholder: '00.000.000/0000-00' },
    { id: 'street', label: 'Rua', placeholder: 'Rua das Flores, 123' },
    { id: 'city', label: 'Cidade', placeholder: 'Manaus' },
    { id: 'state', label: 'Estado', placeholder: 'AM' },
    { id: 'zip', label: 'CEP', placeholder: '69000-000' },
  ],
  3: [
    { id: 'category', label: 'Categoria', placeholder: 'Ex: Saúde, Crianças, Idosos' },
    { id: 'subcategory', label: 'Subcategoria', placeholder: 'Ex: Abrigo, Alimentação' },
    { id: 'audience', label: 'Público atendido', placeholder: 'Descreva quem vocês atendem' },
  ],
  4: [
    { id: 'logo_url', label: 'URL do logo', type: 'url', placeholder: 'https://...' },
    { id: 'photo_url', label: 'URL de foto do local', type: 'url', placeholder: 'https://...' },
  ],
  5: [
    { id: 'mission', label: 'Missão', placeholder: 'Nossa missão é...' },
    { id: 'founded_year', label: 'Ano de fundação', type: 'number', placeholder: '2010' },
    { id: 'history', label: 'História', placeholder: 'Conte a história da instituição' },
  ],
  6: [],
}

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white overflow-y-auto'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="flex-1">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span id="step-label">Passo 1 de ${TOTAL_STEPS}</span>
          <span id="step-title">${stepTitles[0]}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div id="step-progress" class="bg-salvee-orange h-1.5 rounded-full transition-all" style="width:${(1 / TOTAL_STEPS) * 100}%"></div>
        </div>
      </div>
    </div>
    <div id="step-content" class="p-6 flex flex-col gap-4"></div>
    <div id="step-btn" class="p-6 pt-0 pb-safe"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; renderCurrentStep() }
    else history.back()
  })
  renderCurrentStep()
}

function updateProgress(): void {
  document.getElementById('step-label')!.textContent = `Passo ${currentStep} de ${TOTAL_STEPS}`
  document.getElementById('step-title')!.textContent = stepTitles[currentStep - 1]
  ;(document.getElementById('step-progress') as HTMLElement).style.width = `${(currentStep / TOTAL_STEPS) * 100}%`
}

function renderCurrentStep(): void {
  updateProgress()
  const content = document.getElementById('step-content')!
  const btnContainer = document.getElementById('step-btn')!
  content.innerHTML = ''
  btnContainer.innerHTML = ''

  if (currentStep < 6) {
    stepFields[currentStep].forEach(f => {
      const wrapper = document.createElement('div')
      wrapper.appendChild(Input({ id: f.id, label: f.label, type: f.type, placeholder: f.placeholder, required: true }))
      content.appendChild(wrapper)
    })
  } else {
    content.innerHTML = `
      <div class="text-center py-4">
        <div class="text-4xl mb-4">📎</div>
        <h3 class="font-semibold text-gray-900 mb-2">Documentação</h3>
        <p class="text-sm text-gray-500 mb-4">Envie os documentos necessários para validação.</p>
        <input type="file" id="doc-upload" multiple accept=".pdf,.jpg,.png"
          class="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-salvee-orange-bg file:text-salvee-orange file:font-medium" />
      </div>
    `
  }

  const isLast = currentStep === TOTAL_STEPS
  btnContainer.appendChild(Button({
    label: isLast ? 'Enviar para análise' : 'Avançar',
    variant: 'primary',
    fullWidth: true,
    onClick: () => void handleSubmit(content),
  }))
}

async function handleSubmit(content: HTMLElement): Promise<void> {
  const data: Record<string, string> = {}
  content.querySelectorAll('input, textarea, select').forEach(el => {
    const inp = el as HTMLInputElement
    if (inp.id && inp.id !== 'doc-upload') data[inp.id] = inp.value
  })

  const overlay = LoadingOverlay()
  document.body.appendChild(overlay)
  try {
    await institutionService.registerStep({ step: currentStep, data })
    if (currentStep < TOTAL_STEPS) {
      currentStep++
      renderCurrentStep()
    } else {
      showToast('Cadastro enviado para análise!', 'success')
      setTimeout(() => { window.location.hash = '/feed' }, 2000)
    }
  } catch (err) {
    showToast(err instanceof ApiError ? err.message : 'Erro ao salvar. Tente novamente.', 'error')
  } finally {
    overlay.remove()
  }
}

export function unmount(): void {
  currentStep = 1
}
