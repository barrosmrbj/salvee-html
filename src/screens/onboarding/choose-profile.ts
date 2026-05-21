import bgImg from '../../../.Documentacao/inicio.jpg'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen'
  el.style.cssText = `background-image: url(${bgImg}); background-size: cover; background-position: center;`

  el.innerHTML = `
    <div class="absolute inset-0 bg-[#FF6B00]/60"></div>
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white mb-2">Qual é o seu perfil?</h1>
        <p class="text-white/80 text-sm">Escolha o tipo de conta para continuar</p>
      </div>
      <div id="profile-options" class="w-full flex flex-col gap-4"></div>
    </div>
  `
  return el
}

export function mount(): void {
  const container = document.getElementById('profile-options')!

  const profiles = [
    { title: 'Usuário', description: 'Quero apoiar causas, fazer doações e participar de eventos.', hash: '/feed', icon: '👤' },
    { title: 'Instituição', description: 'Represento uma ONG, abrigo ou projeto social.', hash: '/register/institution', icon: '🏢' },
  ]

  profiles.forEach(p => {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'w-full p-5 rounded-2xl bg-white/95 border-2 border-transparent hover:border-white text-left transition-colors shadow-md'
    card.innerHTML = `
      <div class="flex items-start gap-4">
        <span class="text-3xl">${p.icon}</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-1">${p.title}</h3>
          <p class="text-sm text-gray-500">${p.description}</p>
        </div>
      </div>
    `
    card.addEventListener('click', () => { window.location.hash = p.hash })
    container.appendChild(card)
  })
}
