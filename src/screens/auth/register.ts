import { Button, Input, getInputValue, showToast, LoadingOverlay, SocialLogin } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'
import { getHashQuery } from '@/router'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white overflow-y-auto'

  el.innerHTML = `
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold ml-2">Crie uma conta</h1>
    </div>
    <div class="p-6 flex flex-col gap-4">
      <p class="text-gray-500 text-sm">Preencha as informações abaixo para criar sua conta</p>
      <p id="account-hint" class="hidden text-sm text-salvee-orange bg-salvee-orange-bg rounded-xl px-4 py-3"></p>
      <form id="register-form" class="flex flex-col gap-4">
        <div id="field-name"></div>
        <div id="field-email"></div>
        <div id="field-password"></div>
        <div id="field-confirm"></div>
        <label class="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" id="terms" class="mt-0.5 accent-salvee-orange" />
          <span>Eu concordo com os <a href="#" class="text-salvee-orange underline">termos & condições</a></span>
        </label>
        <div id="btn-register"></div>
      </form>
      <div id="social-section" class="hidden">
        <div class="flex items-center gap-3 my-2">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">ou crie a conta com</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        <div id="social-register" class="mt-4"></div>
      </div>
      <p class="text-center text-sm text-gray-500">Já tem uma conta? <a href="#/login" class="text-salvee-orange font-medium">Clique aqui</a></p>
    </div>
  `
  return el
}

let accountType: 'user' | 'institution' = 'user'

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  // tipo escolhido na tela anterior (#/register?tipo=instituicao)
  accountType = getHashQuery().get('tipo') === 'instituicao' ? 'institution' : 'user'
  if (accountType === 'institution') {
    const hint = document.getElementById('account-hint')!
    hint.textContent = 'Conta de instituição: primeiro crie o acesso do responsável. Em seguida você preenche os dados da instituição, que passam pela análise da equipe Salvee.'
    hint.classList.remove('hidden')
  }

  const form = document.getElementById('register-form')!
  form.querySelector('#field-name')!.appendChild(Input({ id: 'name', label: 'Nome', placeholder: 'Ex. José Lucas', required: true }))
  form.querySelector('#field-email')!.appendChild(Input({ id: 'email', label: 'Email', type: 'email', placeholder: 'seuemail@gmail.com', required: true }))
  form.querySelector('#field-password')!.appendChild(Input({ id: 'password', label: 'Senha', type: 'password', placeholder: '••••••••', required: true }))
  form.querySelector('#field-confirm')!.appendChild(Input({ id: 'confirm', label: 'Confirme a senha', type: 'password', placeholder: '••••••••', required: true }))

  document.getElementById('btn-register')!.appendChild(
    Button({ label: 'Avançar', variant: 'primary', fullWidth: true, type: 'submit' })
  )

  document.getElementById('social-register')!.appendChild(SocialLogin('Cadastrar', document.getElementById('social-section')!))

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = getInputValue(form, 'name')
    const email = getInputValue(form, 'email')
    const password = getInputValue(form, 'password')
    const confirm = getInputValue(form, 'confirm')
    const terms = (form.querySelector('#terms') as HTMLInputElement).checked

    if (!name || !email || !password) { showToast('Preencha todos os campos', 'error'); return }
    if (password !== confirm) { showToast('As senhas não coincidem', 'error'); return }
    if (!terms) { showToast('Aceite os termos para continuar', 'error'); return }

    const overlay = LoadingOverlay()
    document.body.appendChild(overlay)
    try {
      await authService.register({ name, email, password, accountType })
      // confirmação por e-mail (SMS fica para quando houver provedor; tela /verify-phone mantida)
      window.location.hash = '/verify-email'
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro no cadastro', 'error')
    } finally {
      overlay.remove()
    }
  })
}
