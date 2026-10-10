import { Button } from '@/components'
import girlSvg from '../../../.Documentacao/ilustracoes_salvee/__girl_salvee_006.svg?url'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-salvee-orange'

  el.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-8 text-center">
        <img src="${girlSvg}" alt="Bem-vindo ao Salvee" class="w-80 h-80 object-contain drop-shadow-lg" />
        <div class="flex flex-col gap-3">
          <h1 class="text-white text-3xl font-bold">Seja bem-vindo(a)!</h1>
          <p class="text-white/90 text-base leading-relaxed">
            <span class="font-semibold">Pronto!</span> Seu perfil está ativo.<br/>
            Agora você faz parte do Salvee.
          </p>
        </div>
        <div id="success-actions" class="w-full"></div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  const actions = document.getElementById('success-actions')!
  actions.appendChild(
    Button({
      label: 'Continuar',
      variant: 'secondary',
      fullWidth: true,
      // próximo passo: escolher Usuário ou Instituição
      onClick: () => { window.location.hash = '/choose-profile' },
    })
  )
}
