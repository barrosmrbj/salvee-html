import { Button } from '@/components'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-salvee-orange'

  el.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-6 text-center">
        <div class="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" fill="white" fill-opacity="0.3"/>
            <path d="M32 16C23.163 16 16 23.163 16 32s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16z" fill="white"/>
            <path d="M24 32l6 6 12-12" stroke="#FF6B00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 class="text-white text-4xl font-bold mb-2">Olá!</h1>
          <p class="text-white/80 text-base leading-relaxed">
            Ajudar nunca foi tão fácil. Grandes mudanças acontecem com pequenos cliques.
          </p>
        </div>
      </div>
    </div>
    <div id="welcome-actions" class="p-6 pb-safe flex flex-col gap-3"></div>
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
