import { Button } from '@/components'
import girlSvg from '../../.Documentacao/ilustracoes_salvee/__girl_salvee_003.svg?url'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-salvee-orange'

  el.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-6 text-center w-full">
        <img src="${girlSvg}" alt="Ilustração Salvee" class="w-48 h-48 object-contain" />
        <div>
          <h1 class="text-white text-4xl font-bold mb-2">Olá!</h1>
          <p class="text-white/80 text-base leading-relaxed">
            Ajudar nunca foi tão fácil. Grandes mudanças acontecem com pequenos cliques.
          </p>
        </div>
        <div id="welcome-actions" class="flex flex-col gap-3 w-full"></div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  const actions = document.getElementById('welcome-actions')!

  actions.appendChild(
    Button({
      label: 'Comece aqui',
      variant: 'secondary',
      fullWidth: true,
      // todo mundo cria primeiro o acesso (o responsável, no caso de instituição); a escolha
      // Usuário/Instituição vem depois do cadastro
      onClick: () => { window.location.hash = '/register' },
    })
  )

  const loginBtn = Button({
    label: 'Já tenho uma conta',
    variant: 'ghost',
    fullWidth: true,
    onClick: () => { window.location.hash = '/login' },
  })
  loginBtn.classList.add('text-white', 'border', 'border-white/40', 'hover:bg-white/10')
  actions.appendChild(loginBtn)
}
