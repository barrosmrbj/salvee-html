import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'

  el.innerHTML = `
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold ml-2">Esqueci minha senha</h1>
    </div>
    <div class="flex-1 p-6 flex flex-col gap-6">
      <p class="text-gray-500 text-sm">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
      <form id="forgot-form" class="flex flex-col gap-4">
        <div id="field-email"></div>
        <div id="btn-send"></div>
      </form>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())

  const form = document.getElementById('forgot-form')!
  form.querySelector('#field-email')!.appendChild(
    Input({ id: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: true })
  )
  document.getElementById('btn-send')!.appendChild(
    Button({ label: 'Enviar link', variant: 'primary', fullWidth: true, type: 'submit' })
  )

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = getInputValue(form, 'email')
    if (!email) { showToast('Digite seu e-mail', 'error'); return }

    const overlay = LoadingOverlay()
    document.body.appendChild(overlay)
    try {
      await authService.forgotPassword(email)
      showToast('Link enviado! Verifique seu e-mail.', 'success')
      setTimeout(() => { window.location.hash = '/login' }, 2000)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao enviar. Tente novamente.', 'error')
    } finally {
      overlay.remove()
    }
  })
}
