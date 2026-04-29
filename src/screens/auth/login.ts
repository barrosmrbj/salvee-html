import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'

  el.innerHTML = `
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
    </div>
    <div class="flex-1 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
      <p class="text-gray-500 text-sm mb-8">Acesse sua conta Salvee</p>
      <form id="login-form" class="flex flex-col gap-4">
        <div id="field-email"></div>
        <div id="field-password"></div>
        <a href="#/forgot-password" class="text-salvee-orange text-sm font-medium text-right self-end">Esqueci minha senha</a>
        <div id="btn-login" class="mt-2"></div>
      </form>
      <div class="flex items-center gap-3 my-6">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400">ou entre com</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div id="social-buttons" class="flex gap-3 justify-center"></div>
      <p class="text-center text-sm text-gray-500 mt-6">
        Não tem conta? <a href="#/register" class="text-salvee-orange font-medium">Cadastre-se</a>
      </p>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())

  const form = document.getElementById('login-form')!
  form.querySelector('#field-email')!.appendChild(
    Input({ id: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: true })
  )
  form.querySelector('#field-password')!.appendChild(
    Input({ id: 'password', label: 'Senha', type: 'password', placeholder: '••••••••', required: true })
  )
  document.getElementById('btn-login')!.appendChild(
    Button({ label: 'Entrar', variant: 'primary', fullWidth: true, type: 'submit' })
  )

  const socialContainer = document.getElementById('social-buttons')!
  const providers = [
    { label: 'Apple', bg: 'bg-black text-white', icon: '🍎' },
    { label: 'Google', bg: 'bg-white border border-gray-200 text-gray-700', icon: 'G' },
    { label: 'Facebook', bg: 'bg-blue-600 text-white', icon: 'f' },
  ]
  providers.forEach(p => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center text-lg font-bold`
    btn.title = `Entrar com ${p.label}`
    btn.textContent = p.icon
    socialContainer.appendChild(btn)
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = getInputValue(form, 'email')
    const password = getInputValue(form, 'password')
    if (!email || !password) { showToast('Preencha todos os campos', 'error'); return }

    const overlay = LoadingOverlay()
    document.body.appendChild(overlay)
    try {
      await authService.login({ email, password })
      window.location.hash = '/feed'
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao entrar', 'error')
    } finally {
      overlay.remove()
    }
  })
}
