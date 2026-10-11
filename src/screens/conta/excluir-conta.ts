// src/screens/conta/excluir-conta.ts — #/excluir-conta (pública)
// Logado: confirma e exclui. Sem login: explica como pedir (a Google Play exige um link na web para isso).
import { Button, Input, PageHeader, getInputValue, showToast } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'
import { EMPRESA, campo } from '@/config/empresa'

export function render(): HTMLElement {
  const logged = authService.isAuthenticated()
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.appendChild(PageHeader('Excluir conta', logged ? '#/settings' : '#/welcome'))
  const box = document.createElement('div')
  box.className = 'p-4 pb-24 flex flex-col gap-4'
  box.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2 text-sm text-gray-700">
      <h2 class="font-semibold text-gray-900">O que acontece</h2>
      <ul class="list-disc pl-5 flex flex-col gap-1">
        <li>Sua conta, perfil e foto são apagados.</li>
        <li>Curtidas, comentários, instituições seguidas, inscrições em eventos, pontos (XP e Salves) e recompensas também.</li>
        <li>Cadastros de instituição ainda não publicados são apagados.</li>
        <li>As doações continuam registradas para a prestação de contas das instituições, mas sem o seu nome e sem a mensagem.</li>
        <li><b>Não dá para desfazer.</b></li>
      </ul>
      <p class="text-xs text-gray-500">Se você é responsável por uma instituição publicada, fale com o suporte antes, para transferir ou encerrar a instituição.</p>
    </div>
    <div id="delete-area"></div>
  `
  el.appendChild(box)
  return el
}

export function mount(): void {
  const area = document.getElementById('delete-area')!
  if (!authService.isAuthenticated()) {
    const email = campo(EMPRESA.emailEncarregado || EMPRESA.emailContato, 'e-mail de contato')
    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 text-sm text-gray-700'
    const p1 = document.createElement('p')
    p1.textContent = 'Para excluir, entre na sua conta e volte a esta página (ou vá em Configurações → Segurança → Excluir conta).'
    const login = document.createElement('a')
    login.href = '#/login'
    login.className = 'w-full py-3 rounded-xl bg-salvee-orange text-white font-semibold text-center'
    login.textContent = 'Entrar'
    const p2 = document.createElement('p')
    p2.className = 'text-xs text-gray-500'
    p2.textContent = `Sem acesso à conta? Peça a exclusão pelo e-mail ${email}, a partir do e-mail cadastrado.`
    card.append(p1, login, p2)
    area.appendChild(card)
    return
  }

  const form = document.createElement('form')
  form.className = 'bg-white rounded-2xl border border-red-100 p-4 flex flex-col gap-4'
  const hint = document.createElement('p')
  hint.className = 'text-sm text-gray-600'
  hint.textContent = 'Para confirmar, digite sua senha e a palavra EXCLUIR. Se você entrou com Google, Facebook ou Apple e não tem senha, deixe a senha em branco.'
  form.append(
    hint,
    Input({ id: 'del-password', label: 'Senha', type: 'password' }),
    Input({ id: 'del-confirm', label: 'Digite EXCLUIR', placeholder: 'EXCLUIR', required: true }),
    Button({ label: 'Excluir minha conta definitivamente', variant: 'destructive', fullWidth: true, type: 'submit' }),
  )
  area.appendChild(form)

  form.addEventListener('submit', async e => {
    e.preventDefault()
    if (getInputValue(form, 'del-confirm').trim().toUpperCase() !== 'EXCLUIR') {
      showToast('Digite EXCLUIR para confirmar', 'error')
      return
    }
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    btn.disabled = true
    try {
      await authService.deleteAccount(getInputValue(form, 'del-password'))
      showToast('Sua conta foi excluída', 'success')
      window.location.replace('#/welcome')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao excluir a conta', 'error')
      btn.disabled = false
    }
  })
}
