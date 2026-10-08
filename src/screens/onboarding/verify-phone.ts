import { Button, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'

let phone = ''
let step: 'input' | 'code' = 'input'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
    </div>
    <div id="step-content" class="flex-1 p-6 flex flex-col items-center text-center gap-6">
      <div class="w-20 h-20 bg-salvee-orange-bg rounded-full flex items-center justify-center text-4xl">📱</div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  renderStep()
}

function renderStep(): void {
  const content = document.getElementById('step-content')!
  const icon = content.querySelector('.text-4xl')!

  // Remove everything after the icon
  while (content.lastChild !== icon) content.removeChild(content.lastChild!)

  if (step === 'input') {
    const titleEl = document.createElement('div')
    titleEl.innerHTML = `
      <h1 class="text-2xl font-bold text-gray-900">Verifique seu número</h1>
      <p class="text-gray-500 text-sm mt-2">Preencha o campo abaixo com o seu país de origem seguido do número de celular.</p>
    `
    content.appendChild(titleEl)

    const inputRow = document.createElement('div')
    inputRow.className = 'flex gap-2 w-full'
    inputRow.innerHTML = `
      <select class="px-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base">
        <option>🇧🇷 +55</option>
      </select>
      <input id="phone-input" type="tel" placeholder="(92) 99999-9999"
        class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base outline-none focus:border-salvee-orange" />
    `
    content.appendChild(inputRow)

    const btnWrapper = document.createElement('div')
    btnWrapper.className = 'w-full'
    btnWrapper.appendChild(Button({
      label: 'Enviar',
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        phone = (document.getElementById('phone-input') as HTMLInputElement).value
        if (!phone) { showToast('Digite seu telefone', 'error'); return }
        const overlay = LoadingOverlay()
        document.body.appendChild(overlay)
        try {
          await authService.sendPhoneCode(phone)
          step = 'code'
          renderStep()
        } catch (err) {
          showToast(err instanceof ApiError ? err.message : 'Erro ao enviar código', 'error')
        } finally {
          overlay.remove()
        }
      },
    }))
    content.appendChild(btnWrapper)
  } else {
    const titleEl = document.createElement('div')
    titleEl.innerHTML = `
      <h1 class="text-2xl font-bold text-gray-900">Código de verificação</h1>
    `
    const desc = document.createElement('p')
    desc.className = 'text-gray-500 text-sm mt-2'
    desc.textContent = `Insira o código que foi enviado para o número +55 ${phone}`
    titleEl.appendChild(desc)
    content.appendChild(titleEl)

    const otpRow = document.createElement('div')
    otpRow.className = 'flex gap-2 justify-center'
    for (let i = 0; i < 4; i++) {
      const inp = document.createElement('input')
      inp.id = `otp-${i}`
      inp.type = 'tel'
      inp.maxLength = 1
      inp.className = 'w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 outline-none focus:border-salvee-orange'
      inp.addEventListener('input', () => {
        if (inp.value && i < 3) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement).focus()
      })
      otpRow.appendChild(inp)
    }
    content.appendChild(otpRow)

    const btnWrapper = document.createElement('div')
    btnWrapper.className = 'w-full'
    btnWrapper.appendChild(Button({
      label: 'Enviar',
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        const code = [0, 1, 2, 3].map(i => (document.getElementById(`otp-${i}`) as HTMLInputElement).value).join('')
        if (code.length !== 4) { showToast('Digite o código completo', 'error'); return }
        const overlay = LoadingOverlay()
        document.body.appendChild(overlay)
        try {
          await authService.verifyPhone(phone, code)
          window.location.hash = '/welcome-success'
        } catch (err) {
          showToast(err instanceof ApiError ? err.message : 'Código inválido', 'error')
        } finally {
          overlay.remove()
        }
      },
    }))
    content.appendChild(btnWrapper)

    const resendBtn = document.createElement('button')
    resendBtn.type = 'button'
    resendBtn.className = 'text-salvee-orange text-sm font-medium'
    resendBtn.textContent = 'Reenviar SMS'
    resendBtn.addEventListener('click', async () => {
      try {
        await authService.sendPhoneCode(phone)
        showToast('Novo código enviado!', 'success')
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Erro ao reenviar o código', 'error')
      }
    })
    content.appendChild(resendBtn)
  }

  // enquanto não houver envio real de SMS em produção, a verificação não pode travar o cadastro
  const skipBtn = document.createElement('button')
  skipBtn.type = 'button'
  skipBtn.className = 'text-gray-400 text-sm font-medium underline'
  skipBtn.textContent = 'Pular por enquanto'
  skipBtn.addEventListener('click', () => { window.location.hash = '/welcome-success' })
  content.appendChild(skipBtn)
}

export function unmount(): void {
  step = 'input'
  phone = ''
}
