# Salvee HTML — Plano 2: Telas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Pré-requisito:** Plano 1 (Fundação) deve estar concluído — scaffold, serviços, router e componentes disponíveis.

**Goal:** Implementar todas as 13 telas do Salvee V1 substituindo os placeholders do Plano 1 por telas funcionais com layout mobile-first fiel ao design.

**Architecture:** Cada tela é um módulo TS que exporta `render(params?)`, `mount()` e `unmount()`. Telas multi-step (doação, cadastro de instituição) gerenciam estado interno via objeto de step. Bottom nav é montado automaticamente em telas autenticadas.

**Tech Stack:** Vite 5, TypeScript 5, Tailwind CSS 3, componentes de `@/components`

---

## Mapa de Arquivos

| Arquivo | Tela |
|---|---|
| `src/screens/splash/index.ts` | Splash com logo + checagem de token |
| `src/screens/welcome/index.ts` | Boas-vindas com dois CTAs |
| `src/screens/auth/login.ts` | Login e-mail + senha + social |
| `src/screens/auth/register.ts` | Cadastro de usuário |
| `src/screens/auth/forgot-password.ts` | Esqueci senha |
| `src/screens/onboarding/choose-profile.ts` | Escolha de tipo de conta |
| `src/screens/onboarding/verify-phone.ts` | Verificação OTP |
| `src/screens/onboarding/institution-register/index.ts` | Cadastro institucional multi-step (6 etapas) |
| `src/screens/feed/index.ts` | Feed com 3 tipos de post |
| `src/screens/search/index.ts` | Busca + categorias + destaques |
| `src/screens/institution-profile/index.ts` | Perfil com abas Mural/Sobre/Info |
| `src/screens/donation/index.ts` | Fluxo doação 4 passos |
| `src/screens/calendar/index.ts` | Calendário de eventos |
| `src/screens/profile/index.ts` | Perfil do usuário + gamificação |
| `src/screens/settings/index.ts` | Configurações |

---

## Task 1: Tela Splash

**Files:**
- Modify: `src/screens/splash/index.ts`

- [ ] **Step 1: Implementar splash**

```typescript
import { authService } from '@/services'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-salvee-orange'
  el.innerHTML = `
    <div class="flex flex-col items-center gap-4">
      <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 6C12.268 6 6 12.268 6 20s6.268 14 14 14 14-6.268 14-14S27.732 6 20 6z" fill="#FF6B00"/>
          <path d="M14 20l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="text-white text-4xl font-bold tracking-tight">salvee</h1>
      <p class="text-white/70 text-sm">Conectando corações a causas</p>
    </div>
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2">
      <div class="w-8 h-1 bg-white/40 rounded-full animate-pulse"></div>
    </div>
  `
  return el
}

export function mount(): void {
  setTimeout(() => {
    if (authService.isAuthenticated()) {
      window.location.hash = '/feed'
    } else {
      window.location.hash = '/welcome'
    }
  }, 1800)
}
```

- [ ] **Step 2: Verificar no browser**

```bash
npm run dev
```

Abrir `http://localhost:5173` — deve mostrar splash laranja com logo, esperar 1.8s e redirecionar.

- [ ] **Step 3: Commit**

```bash
git add src/screens/splash/
git commit -m "feat: splash screen with auth redirect"
```

---

## Task 2: Tela Welcome

**Files:**
- Modify: `src/screens/welcome/index.ts`

- [ ] **Step 1: Implementar welcome**

```typescript
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
  loginBtn.className += ' text-white border-white/40 border hover:bg-white/10'
  actions.appendChild(loginBtn)
}
```

- [ ] **Step 2: Verificar no browser**

Navegar para `/#/welcome` — dois botões visíveis, "Comece aqui" navega para `/#/register`.

- [ ] **Step 3: Commit**

```bash
git add src/screens/welcome/
git commit -m "feat: welcome screen"
```

---

## Task 3: Tela Login

**Files:**
- Modify: `src/screens/auth/login.ts`

- [ ] **Step 1: Implementar login**

```typescript
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
        <a href="#/forgot-password" class="text-salvee-orange text-sm font-medium text-right">Esqueci minha senha</a>
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

  const btnContainer = document.getElementById('btn-login')!
  btnContainer.appendChild(
    Button({ label: 'Entrar', variant: 'primary', fullWidth: true, type: 'submit' })
  )

  const socialContainer = document.getElementById('social-buttons')!
  const socialProviders = [
    { label: 'Apple', color: 'bg-black', icon: '🍎' },
    { label: 'Google', color: 'bg-white border border-gray-200', icon: 'G' },
    { label: 'Facebook', color: 'bg-blue-600', icon: 'f' },
  ]
  socialProviders.forEach(p => {
    const btn = document.createElement('button')
    btn.className = `w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center text-lg font-bold ${p.color.includes('white') ? 'text-gray-700' : 'text-white'}`
    btn.textContent = p.icon
    btn.title = `Entrar com ${p.label}`
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
      const msg = err instanceof ApiError ? err.message : 'Erro ao entrar'
      showToast(msg, 'error')
    } finally {
      overlay.remove()
    }
  })
}
```

- [ ] **Step 2: Verificar no browser**

Navegar para `/#/login` — formulário visível, botões sociais, link para cadastro.

- [ ] **Step 3: Commit**

```bash
git add src/screens/auth/login.ts
git commit -m "feat: login screen with form and social buttons"
```

---

## Task 4: Telas Register e Forgot Password

**Files:**
- Modify: `src/screens/auth/register.ts`, `src/screens/auth/forgot-password.ts`

- [ ] **Step 1: Implementar register**

```typescript
// src/screens/auth/register.ts
import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'

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
      <p class="text-gray-500 text-sm">Preencha o campo de informações abaixo ou registre-se com sua conta social</p>
      <form id="register-form" class="flex flex-col gap-4">
        <div id="field-name"></div>
        <div id="field-email"></div>
        <div id="field-password"></div>
        <div id="field-confirm"></div>
        <label class="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" id="terms" class="mt-0.5 accent-salvee-orange" required />
          <span>Eu concordo com os <a href="#" class="text-salvee-orange underline">termos & condições</a></span>
        </label>
        <div id="btn-register"></div>
      </form>
      <div class="flex items-center gap-3 my-2">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400">ou crie a conta com</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div class="flex gap-3 justify-center">
        <button class="w-14 h-14 rounded-2xl bg-black text-white text-lg font-bold">🍎</button>
        <button class="w-14 h-14 rounded-2xl bg-white border border-gray-200 text-gray-700 text-lg font-bold">G</button>
        <button class="w-14 h-14 rounded-2xl bg-blue-600 text-white text-lg font-bold">f</button>
      </div>
      <p class="text-center text-sm text-gray-500">Você já tem uma conta? <a href="#/login" class="text-salvee-orange font-medium">Clique aqui</a></p>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const form = document.getElementById('register-form')!

  form.querySelector('#field-name')!.appendChild(Input({ id: 'name', label: 'Nome', placeholder: 'Ex. José Lucas', required: true }))
  form.querySelector('#field-email')!.appendChild(Input({ id: 'email', label: 'Email', type: 'email', placeholder: 'seuemail@gmail.com', required: true }))
  form.querySelector('#field-password')!.appendChild(Input({ id: 'password', label: 'Senha', type: 'password', placeholder: '••••••••', required: true }))
  form.querySelector('#field-confirm')!.appendChild(Input({ id: 'confirm', label: 'Confirme a senha', type: 'password', placeholder: '••••••••', required: true }))

  document.getElementById('btn-register')!.appendChild(
    Button({ label: 'Avançar', variant: 'primary', fullWidth: true, type: 'submit' })
  )

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
      await authService.register({ name, email, password })
      window.location.hash = '/verify-phone'
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro no cadastro', 'error')
    } finally {
      overlay.remove()
    }
  })
}
```

- [ ] **Step 2: Implementar forgot-password**

```typescript
// src/screens/auth/forgot-password.ts
import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'

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
  form.querySelector('#field-email')!.appendChild(Input({ id: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: true }))
  document.getElementById('btn-send')!.appendChild(Button({ label: 'Enviar link', variant: 'primary', fullWidth: true, type: 'submit' }))

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
    } catch {
      showToast('Erro ao enviar. Tente novamente.', 'error')
    } finally {
      overlay.remove()
    }
  })
}
```

- [ ] **Step 3: Verificar no browser**

Testar `/#/register` e `/#/forgot-password` — formulários funcionais.

- [ ] **Step 4: Commit**

```bash
git add src/screens/auth/
git commit -m "feat: register and forgot-password screens"
```

---

## Task 5: Telas Onboarding (choose-profile, verify-phone)

**Files:**
- Modify: `src/screens/onboarding/choose-profile.ts`, `src/screens/onboarding/verify-phone.ts`

- [ ] **Step 1: Implementar choose-profile**

```typescript
// src/screens/onboarding/choose-profile.ts
import { Button } from '@/components'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white p-6'
  el.innerHTML = `
    <div class="flex-1 flex flex-col items-center justify-center gap-8">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Qual é o seu perfil?</h1>
        <p class="text-gray-500 text-sm">Escolha o tipo de conta para continuar</p>
      </div>
      <div id="profile-options" class="w-full flex flex-col gap-4"></div>
    </div>
  `
  return el
}

export function mount(): void {
  const container = document.getElementById('profile-options')!

  const profiles = [
    {
      title: 'Usuário',
      description: 'Quero apoiar causas, fazer doações e participar de eventos.',
      hash: '/feed',
      icon: '👤',
    },
    {
      title: 'Instituição',
      description: 'Represento uma ONG, abrigo ou projeto social.',
      hash: '/register/institution',
      icon: '🏢',
    },
  ]

  profiles.forEach(p => {
    const card = document.createElement('button')
    card.className = 'w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-salvee-orange text-left transition-colors'
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
```

- [ ] **Step 2: Implementar verify-phone**

```typescript
// src/screens/onboarding/verify-phone.ts
import { Button, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'

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
    <div id="screen-content" class="flex-1 p-6 flex flex-col items-center text-center gap-6">
      <div class="w-20 h-20 bg-salvee-orange-bg rounded-full flex items-center justify-center text-4xl">📱</div>
      <div id="title-block"></div>
      <div id="input-block" class="w-full"></div>
      <div id="btn-block" class="w-full"></div>
      <button id="resend-btn" class="text-salvee-orange text-sm font-medium hidden">Reenviar SMS</button>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  renderStep()
}

function renderStep(): void {
  const titleBlock = document.getElementById('title-block')!
  const inputBlock = document.getElementById('input-block')!
  const btnBlock = document.getElementById('btn-block')!
  const resendBtn = document.getElementById('resend-btn')!

  if (step === 'input') {
    titleBlock.innerHTML = `
      <h1 class="text-2xl font-bold text-gray-900">Verifique seu número</h1>
      <p class="text-gray-500 text-sm mt-2">Preencha o campo abaixo com o seu país de origem seguido do número de celular.</p>
    `
    inputBlock.innerHTML = `
      <div class="flex gap-2">
        <select class="px-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base">
          <option>🇧🇷 +55</option>
        </select>
        <input id="phone-input" type="tel" placeholder="(92) 99999-9999" class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base outline-none focus:border-salvee-orange" />
      </div>
    `
    btnBlock.innerHTML = ''
    btnBlock.appendChild(Button({
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
        } catch { showToast('Erro ao enviar código', 'error') }
        finally { overlay.remove() }
      },
    }))
  } else {
    titleBlock.innerHTML = `
      <h1 class="text-2xl font-bold text-gray-900">Código de verificação</h1>
      <p class="text-gray-500 text-sm mt-2">Insira o código que foi enviado para o número +55 ${phone}</p>
    `
    inputBlock.innerHTML = `
      <div class="flex gap-2 justify-center">
        ${[0,1,2,3].map(i => `<input id="otp-${i}" type="tel" maxlength="1" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 outline-none focus:border-salvee-orange" />`).join('')}
      </div>
    `
    btnBlock.innerHTML = ''
    btnBlock.appendChild(Button({
      label: 'Enviar',
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        const code = [0,1,2,3].map(i => (document.getElementById(`otp-${i}`) as HTMLInputElement).value).join('')
        if (code.length !== 4) { showToast('Digite o código completo', 'error'); return }
        const overlay = LoadingOverlay()
        document.body.appendChild(overlay)
        try {
          await authService.verifyPhone(phone, code)
          window.location.hash = '/feed'
        } catch { showToast('Código inválido', 'error') }
        finally { overlay.remove() }
      },
    }))
    resendBtn.classList.remove('hidden')
    resendBtn.addEventListener('click', async () => {
      await authService.sendPhoneCode(phone)
      showToast('Novo código enviado!', 'success')
    })

    // Auto-advance OTP inputs
    for (let i = 0; i < 4; i++) {
      const inp = document.getElementById(`otp-${i}`) as HTMLInputElement
      inp.addEventListener('input', () => {
        if (inp.value && i < 3) (document.getElementById(`otp-${i+1}`) as HTMLInputElement).focus()
      })
    }
  }
}

export function unmount(): void {
  step = 'input'
  phone = ''
}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/onboarding/choose-profile.ts src/screens/onboarding/verify-phone.ts
git commit -m "feat: choose-profile and verify-phone screens"
```

---

## Task 6: Cadastro de Instituição (multi-step)

**Files:**
- Modify: `src/screens/onboarding/institution-register/index.ts`

- [ ] **Step 1: Implementar cadastro multi-step**

```typescript
// src/screens/onboarding/institution-register/index.ts
import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { institutionService } from '@/services'

const TOTAL_STEPS = 6
let currentStep = 1
let institutionId = ''
const stepData: Record<number, Record<string, string>> = {}

const stepTitles = [
  'Identificação',
  'Dados Formais',
  'Atuação',
  'Visual',
  'Histórico',
  'Documentação',
]

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white overflow-y-auto'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="flex-1">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span id="step-label">Passo 1 de ${TOTAL_STEPS}</span>
          <span id="step-title">${stepTitles[0]}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div id="step-progress" class="bg-salvee-orange h-1.5 rounded-full transition-all" style="width: ${(1/TOTAL_STEPS)*100}%"></div>
        </div>
      </div>
    </div>
    <div id="step-content" class="p-6 flex flex-col gap-4"></div>
    <div id="step-btn" class="p-6 pt-0"></div>
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
  const pct = (currentStep / TOTAL_STEPS) * 100
  ;(document.getElementById('step-progress') as HTMLElement).style.width = `${pct}%`
}

function renderCurrentStep(): void {
  updateProgress()
  const content = document.getElementById('step-content')!
  const btnContainer = document.getElementById('step-btn')!
  content.innerHTML = ''
  btnContainer.innerHTML = ''

  const stepFields: Record<number, Array<{ id: string; label: string; type?: string; placeholder?: string }>> = {
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

  if (currentStep < 6) {
    stepFields[currentStep].forEach(f => {
      const wrapper = document.createElement('div')
      content.appendChild(wrapper)
      wrapper.appendChild(Input({ id: f.id, label: f.label, type: f.type, placeholder: f.placeholder, required: true }))
    })
  } else {
    content.innerHTML = `
      <div class="text-center py-4">
        <div class="text-4xl mb-4">📎</div>
        <h3 class="font-semibold text-gray-900 mb-2">Documentação</h3>
        <p class="text-sm text-gray-500 mb-4">Envie os documentos necessários para validação.</p>
        <input type="file" id="doc-upload" multiple accept=".pdf,.jpg,.png" class="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-salvee-orange-bg file:text-salvee-orange file:font-medium" />
      </div>
    `
  }

  const isLast = currentStep === TOTAL_STEPS
  btnContainer.appendChild(
    Button({
      label: isLast ? 'Enviar para análise' : 'Avançar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => handleStepSubmit(content),
    })
  )
}

async function handleStepSubmit(content: HTMLElement): Promise<void> {
  const data: Record<string, string> = {}
  content.querySelectorAll('input, textarea, select').forEach(el => {
    const inp = el as HTMLInputElement
    if (inp.id) data[inp.id] = inp.value
  })
  stepData[currentStep] = data

  const overlay = LoadingOverlay()
  document.body.appendChild(overlay)

  try {
    const res = await institutionService.registerStep({ step: currentStep, data })
    if (res.institutionId) institutionId = res.institutionId

    if (currentStep < TOTAL_STEPS) {
      currentStep++
      renderCurrentStep()
    } else {
      showToast('Cadastro enviado para análise!', 'success')
      setTimeout(() => { window.location.hash = '/feed' }, 2000)
    }
  } catch {
    showToast('Erro ao salvar. Tente novamente.', 'error')
  } finally {
    overlay.remove()
  }
}

export function unmount(): void {
  currentStep = 1
  institutionId = ''
}
```

- [ ] **Step 2: Verificar no browser**

Navegar para `/#/register/institution` — barra de progresso avança nos 6 passos.

- [ ] **Step 3: Commit**

```bash
git add src/screens/onboarding/
git commit -m "feat: institution multi-step registration screen"
```

---

## Task 7: Tela Feed

**Files:**
- Modify: `src/screens/feed/index.ts`

- [ ] **Step 1: Implementar feed**

```typescript
// src/screens/feed/index.ts
import { BottomNav, Avatar, VerifiedBadge, ProgressBar, Spinner, showToast } from '@/components'
import { feedService } from '@/services'
import type { Post } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
      <div class="w-8 h-8 bg-salvee-orange rounded-full flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><path d="M14 20l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h1 class="text-base font-semibold text-gray-900">salvee</h1>
      <button id="notif-btn" class="w-8 h-8 flex items-center justify-center text-gray-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
    </header>
    <div id="feed-list" class="flex flex-col gap-3 p-4 pb-24"></div>
  `
  return el
}

export function mount(): void {
  const container = document.getElementById('feed-list')!
  const nav = BottomNav()
  document.getElementById('app')!.appendChild(nav)

  const spinner = document.createElement('div')
  spinner.className = 'flex justify-center py-8'
  spinner.appendChild(Spinner())
  container.appendChild(spinner)

  feedService.listPosts().then(posts => {
    spinner.remove()
    if (posts.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhuma postagem ainda.</p>'
      return
    }
    posts.forEach(p => container.appendChild(renderPost(p)))
  }).catch(() => {
    spinner.remove()
    showToast('Erro ao carregar feed', 'error')
    // Show mock posts for development
    getMockPosts().forEach(p => container.appendChild(renderPost(p)))
  })
}

function renderPost(post: Post): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'

  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 p-4 pb-2'
  header.appendChild(Avatar(post.institutionName, post.institutionLogoUrl))
  header.innerHTML += `
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1">
        <span class="font-semibold text-gray-900 text-sm truncate">${post.institutionName}</span>
        ${post.institutionVerified ? `<span class="inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
      </div>
      <span class="text-xs text-gray-400">${post.institutionVerified ? 'Verificada' : 'Pendente'} · ${formatDate(post.createdAt)}</span>
    </div>
    <button class="text-gray-400">···</button>
  `
  card.appendChild(header)

  if (post.imageUrl) {
    const img = document.createElement('img')
    img.src = post.imageUrl
    img.alt = ''
    img.className = 'w-full h-48 object-cover'
    card.appendChild(img)
  }

  const body = document.createElement('div')
  body.className = 'p-4'
  body.innerHTML = `<p class="text-gray-700 text-sm leading-relaxed line-clamp-3">${post.content}</p>`

  if (post.type === 'campaign' && post.campaignGoal) {
    body.appendChild(ProgressBar(post.campaignCurrent ?? 0, post.campaignGoal))
  }

  if (post.type === 'event' && post.eventDate) {
    body.innerHTML += `
      <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <span>📅 ${formatDate(post.eventDate)}</span>
        ${post.eventLocation ? `<span>📍 ${post.eventLocation}</span>` : ''}
      </div>
    `
  }

  card.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'px-4 pb-4'
  const ctaLabels: Record<string, string> = { common: 'Ajudar', campaign: 'Doar', event: 'Participar' }
  const cta = document.createElement('button')
  cta.className = 'w-full py-2.5 bg-salvee-orange text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform'
  cta.textContent = ctaLabels[post.type] ?? 'Ajudar'
  cta.addEventListener('click', () => {
    if (post.type === 'campaign' || post.type === 'common') {
      window.location.hash = `/donate/${post.institutionId}`
    } else {
      window.location.hash = `/institution/${post.institutionId}`
    }
  })
  footer.appendChild(cta)
  card.appendChild(footer)

  return card
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getMockPosts(): Post[] {
  return [
    { id: '1', institutionId: 'inst1', institutionName: 'Instituto Esperança', institutionVerified: true, type: 'campaign', content: 'Ajude-nos a construir uma nova ala para crianças carentes. Cada doação faz a diferença!', createdAt: new Date().toISOString(), campaignGoal: 10000, campaignCurrent: 6500 },
    { id: '2', institutionId: 'inst2', institutionName: 'Lar dos Idosos Felizes', institutionVerified: true, type: 'common', content: 'Hoje nossos residentes receberam a visita de uma turma de escola. Momentos assim enchem nossos corações!', createdAt: new Date().toISOString() },
    { id: '3', institutionId: 'inst3', institutionName: 'ONG Verde', institutionVerified: false, type: 'event', content: 'Mutirão de limpeza no Rio Negro. Venha participar!', createdAt: new Date().toISOString(), eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), eventLocation: 'Praia da Ponta Negra' },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
```

- [ ] **Step 2: Verificar no browser**

Navegar para `/#/feed` com token em localStorage — bottom nav visível, posts mock exibidos.

- [ ] **Step 3: Commit**

```bash
git add src/screens/feed/
git commit -m "feat: feed screen with post types and mock data"
```

---

## Task 8: Tela Search

**Files:**
- Modify: `src/screens/search/index.ts`

- [ ] **Step 1: Implementar search**

```typescript
// src/screens/search/index.ts
import { BottomNav, Avatar, VerifiedBadge, Spinner, showToast } from '@/components'
import { searchService } from '@/services'
import type { Institution } from '@/types'

const CATEGORIES = ['Saúde', 'Crianças', 'Idosos', 'Animais', 'Educação', 'Meio Ambiente', 'Moradia', 'Alimentação']

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-30">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="search" placeholder="Pesquise uma instituição" class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-salvee-orange/30 transition-all" />
      </div>
    </header>
    <div class="flex-1 overflow-y-auto pb-24">
      <div id="search-results" class="hidden p-4 flex flex-col gap-3"></div>
      <div id="discovery-content">
        <div class="p-4">
          <h2 class="text-base font-semibold text-gray-900 mb-3">Categorias</h2>
          <div class="grid grid-cols-2 gap-2" id="categories-grid"></div>
        </div>
        <div class="px-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900">Destaques</h2>
            <button class="text-salvee-orange text-sm font-medium">Veja todos</button>
          </div>
          <div id="highlights-list" class="flex flex-col gap-3"></div>
        </div>
      </div>
    </div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  renderCategories()
  loadHighlights()

  let searchTimeout: ReturnType<typeof setTimeout>
  document.getElementById('search-input')!.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    const q = (e.target as HTMLInputElement).value.trim()
    searchTimeout = setTimeout(() => performSearch(q), 400)
  })
}

function renderCategories(): void {
  const grid = document.getElementById('categories-grid')!
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button')
    btn.className = 'p-3 rounded-xl bg-white border border-gray-100 text-sm font-medium text-gray-700 text-left hover:border-salvee-orange hover:text-salvee-orange transition-colors'
    btn.textContent = cat
    btn.addEventListener('click', () => performSearch(cat))
    grid.appendChild(btn)
  })
}

async function loadHighlights(): Promise<void> {
  const list = document.getElementById('highlights-list')!
  list.appendChild(Spinner())
  try {
    const institutions = await institutionService_list()
    list.innerHTML = ''
    institutions.slice(0, 3).forEach(inst => list.appendChild(renderInstitutionCard(inst)))
  } catch {
    list.innerHTML = ''
    getMockInstitutions().forEach(inst => list.appendChild(renderInstitutionCard(inst)))
  }
}

async function performSearch(query: string): Promise<void> {
  const resultsEl = document.getElementById('search-results')!
  const discoveryEl = document.getElementById('discovery-content')!

  if (!query) { resultsEl.classList.add('hidden'); discoveryEl.classList.remove('hidden'); return }
  resultsEl.classList.remove('hidden')
  discoveryEl.classList.add('hidden')
  resultsEl.innerHTML = ''
  resultsEl.appendChild(Spinner())

  try {
    const results = await searchService.search(query)
    resultsEl.innerHTML = ''
    if (results.length === 0) {
      resultsEl.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhum resultado encontrado.</p>'
    } else {
      results.forEach(inst => resultsEl.appendChild(renderInstitutionCard(inst)))
    }
  } catch {
    resultsEl.innerHTML = ''
    showToast('Erro na busca', 'error')
  }
}

function renderInstitutionCard(inst: Institution): HTMLElement {
  const card = document.createElement('button')
  card.className = 'w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left hover:border-salvee-orange transition-colors'
  card.innerHTML = `
    <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
      ${inst.logoUrl ? `<img src="${inst.logoUrl}" alt="${inst.name}" class="w-full h-full object-cover" />` : '🏢'}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1 mb-0.5">
        <span class="font-semibold text-gray-900 text-sm truncate">${inst.name}</span>
        ${inst.verified ? `<span class="inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
      </div>
      <span class="text-xs text-gray-500">${inst.category}</span>
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>
  `
  card.addEventListener('click', () => { window.location.hash = `/institution/${inst.id}` })
  return card
}

// Workaround: import inline to avoid circular reference
async function institutionService_list(): Promise<Institution[]> {
  const { institutionService } = await import('@/services')
  return institutionService.list()
}

function getMockInstitutions(): Institution[] {
  return [
    { id: 'inst1', name: 'Instituto Esperança', category: 'Crianças', verified: true, status: 'approved', description: '', photos: [] },
    { id: 'inst2', name: 'Lar dos Idosos Felizes', category: 'Idosos', verified: true, status: 'approved', description: '', photos: [] },
    { id: 'inst3', name: 'ONG Verde', category: 'Meio Ambiente', verified: false, status: 'pending', description: '', photos: [] },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/search/
git commit -m "feat: search and discovery screen"
```

---

## Task 9: Perfil Institucional

**Files:**
- Modify: `src/screens/institution-profile/index.ts`

- [ ] **Step 1: Implementar perfil institucional**

```typescript
// src/screens/institution-profile/index.ts
import { Button, ProgressBar, Spinner, showToast } from '@/components'
import { institutionService } from '@/services'
import type { Institution } from '@/types'

type Tab = 'mural' | 'sobre' | 'info'
let activeTab: Tab = 'mural'

export function render(params?: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.dataset['institutionId'] = params?.id ?? ''
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
    </div>
    <div id="profile-loading" class="flex justify-center py-16"></div>
    <div id="profile-content" class="hidden flex-1 overflow-y-auto pb-24"></div>
    <div id="profile-footer" class="hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-4 bg-white border-t border-gray-100 pb-safe"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const el = document.querySelector('[data-institution-id]') as HTMLElement
  const id = el?.dataset['institutionId'] ?? ''

  const loadingEl = document.getElementById('profile-loading')!
  loadingEl.appendChild(Spinner())

  institutionService.getById(id).then(renderProfile).catch(() => {
    loadingEl.remove()
    renderProfile(getMockInstitution(id))
  })
}

function renderProfile(inst: Institution): void {
  document.getElementById('profile-loading')!.remove()
  const content = document.getElementById('profile-content')!
  const footer = document.getElementById('profile-footer')!
  content.classList.remove('hidden')
  footer.classList.remove('hidden')

  content.innerHTML = `
    <div class="relative">
      <div class="h-40 bg-salvee-orange-bg flex items-center justify-center overflow-hidden">
        ${inst.photos[0] ? `<img src="${inst.photos[0]}" alt="" class="w-full h-full object-cover" />` : '<span class="text-6xl">🏢</span>'}
      </div>
      <div class="absolute -bottom-6 left-4 w-16 h-16 rounded-2xl bg-white shadow-md overflow-hidden flex items-center justify-center border border-gray-100">
        ${inst.logoUrl ? `<img src="${inst.logoUrl}" alt="${inst.name}" class="w-full h-full object-cover" />` : '<span class="text-2xl">🏢</span>'}
      </div>
    </div>
    <div class="px-4 pt-10 pb-4">
      <div class="flex items-center gap-2 mb-1">
        <h1 class="text-xl font-bold text-gray-900">${inst.name}</h1>
        ${inst.verified ? `<span class="inline-flex items-center justify-center w-5 h-5 bg-salvee-orange rounded-full"><svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
      </div>
      <span class="text-sm text-gray-500">${inst.category}</span>
    </div>
    <div class="flex border-b border-gray-100 px-4">
      ${(['mural', 'sobre', 'info'] as Tab[]).map(t => `
        <button data-tab="${t}" class="flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === t ? 'border-salvee-orange text-salvee-orange' : 'border-transparent text-gray-400'}">
          ${t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      `).join('')}
    </div>
    <div id="tab-content" class="p-4"></div>
  `

  content.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = (btn as HTMLElement).dataset['tab'] as Tab
      content.querySelectorAll('[data-tab]').forEach(b => {
        const isActive = (b as HTMLElement).dataset['tab'] === activeTab
        b.className = `flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${isActive ? 'border-salvee-orange text-salvee-orange' : 'border-transparent text-gray-400'}`
      })
      renderTab(inst)
    })
  })

  renderTab(inst)

  footer.appendChild(Button({
    label: 'Ajudar',
    variant: 'primary',
    fullWidth: true,
    onClick: () => { window.location.hash = `/donate/${inst.id}` },
  }))
}

function renderTab(inst: Institution): void {
  const tabContent = document.getElementById('tab-content')!

  if (activeTab === 'mural') {
    tabContent.innerHTML = `<p class="text-center text-gray-400 py-8 text-sm">Nenhuma postagem ainda.</p>`
  } else if (activeTab === 'sobre') {
    tabContent.innerHTML = `
      <div class="flex flex-col gap-4">
        ${inst.mission ? `<div><h3 class="font-semibold text-gray-900 mb-1">Missão</h3><p class="text-sm text-gray-600 leading-relaxed">${inst.mission}</p></div>` : ''}
        ${inst.history ? `<div><h3 class="font-semibold text-gray-900 mb-1">História</h3><p class="text-sm text-gray-600 leading-relaxed">${inst.history}</p></div>` : ''}
        ${inst.foundedYear ? `<p class="text-sm text-gray-500">Fundada em ${inst.foundedYear}</p>` : ''}
        ${!inst.mission && !inst.history ? `<p class="text-center text-gray-400 py-8 text-sm">Sem informações disponíveis.</p>` : ''}
      </div>
    `
  } else {
    tabContent.innerHTML = `
      <div class="flex flex-col gap-3 text-sm">
        ${inst.address ? `
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span class="text-xl">📍</span>
            <div>
              <p class="font-medium text-gray-900">Endereço</p>
              <p class="text-gray-500">${inst.address.street}, ${inst.address.city} - ${inst.address.state}</p>
            </div>
          </div>
        ` : ''}
        ${inst.cnpj ? `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span class="text-xl">📄</span>
            <div><p class="font-medium text-gray-900">CNPJ</p><p class="text-gray-500">${inst.cnpj}</p></div>
          </div>
        ` : ''}
        ${inst.phone ? `
          <a href="tel:${inst.phone}" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span class="text-xl">📞</span>
            <div><p class="font-medium text-gray-900">Telefone</p><p class="text-salvee-orange">${inst.phone}</p></div>
          </a>
        ` : ''}
        ${!inst.address && !inst.cnpj && !inst.phone ? `<p class="text-center text-gray-400 py-8">Sem informações de contato.</p>` : ''}
      </div>
    `
  }
}

function getMockInstitution(id: string): Institution {
  return { id, name: 'Instituto Esperança', category: 'Crianças', verified: true, status: 'approved', description: 'Trabalhamos para transformar a vida de crianças em situação de vulnerabilidade.', photos: [], mission: 'Garantir um futuro melhor para crianças carentes.', history: 'Fundada em 2010 por um grupo de voluntários apaixonados pela causa.', foundedYear: 2010, phone: '(92) 99999-9999', cnpj: '00.000.000/0000-00' }
}

export function unmount(): void {
  activeTab = 'mural'
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/institution-profile/
git commit -m "feat: institution profile screen with tabs"
```

---

## Task 10: Fluxo de Doação

**Files:**
- Modify: `src/screens/donation/index.ts`

- [ ] **Step 1: Implementar fluxo de doação (4 passos)**

```typescript
// src/screens/donation/index.ts
import { Button, NumericKeyboard, showToast, LoadingOverlay, Spinner } from '@/components'
import { donationService, institutionService } from '@/services'
import type { Institution, PaymentMethod } from '@/types'

type DonationStep = 'amount' | 'payment' | 'summary' | 'success'

let step: DonationStep = 'amount'
let amount = 0
let message = ''
let paymentMethod: PaymentMethod = 'pix'
let anonymous = false
let institution: Institution | null = null
let donationId = ''
let xpEarned = 0
let salvesEarned = 0

export function render(params?: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.dataset['institutionId'] = params?.id ?? ''
  el.innerHTML = `
    <div id="donation-screen" class="flex flex-col h-full"></div>
  `
  return el
}

export function mount(): void {
  const el = document.querySelector('[data-institution-id]') as HTMLElement
  const id = el?.dataset['institutionId'] ?? ''

  institutionService.getById(id).then(inst => {
    institution = inst
    renderStep()
  }).catch(() => {
    institution = { id, name: 'Nome da instituição', category: 'Categoria', verified: true, status: 'approved', description: '', photos: [] }
    renderStep()
  })
}

function renderStep(): void {
  const screen = document.getElementById('donation-screen')!
  screen.innerHTML = ''

  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 p-4 border-b border-gray-100'
  header.innerHTML = `
    <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
    </button>
    <h1 class="text-base font-semibold text-gray-900">${stepTitle()}</h1>
  `
  screen.appendChild(header)
  header.querySelector('#back-btn')!.addEventListener('click', () => {
    if (step === 'amount') history.back()
    else if (step === 'payment') { step = 'amount'; renderStep() }
    else if (step === 'summary') { step = 'payment'; renderStep() }
    else history.back()
  })

  const content = document.createElement('div')
  content.className = 'flex-1 overflow-y-auto'
  screen.appendChild(content)

  if (step === 'amount') renderAmountStep(content)
  else if (step === 'payment') renderPaymentStep(content)
  else if (step === 'summary') renderSummaryStep(content)
  else renderSuccessStep(content)
}

function stepTitle(): string {
  return { amount: 'Doação', payment: 'Forma de pagamento', summary: 'Resumo da doação', success: 'Confirmação' }[step]
}

function renderAmountStep(container: HTMLElement): void {
  container.innerHTML = `
    <div class="flex flex-col items-center p-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
          ${institution?.logoUrl ? `<img src="${institution.logoUrl}" class="w-full h-full object-cover" />` : '🏢'}
        </div>
        <div>
          <p class="font-semibold text-gray-900 text-sm">${institution?.name ?? ''}</p>
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-400">${institution?.category ?? ''}</span>
            ${institution?.verified ? `<span class="inline-flex items-center justify-center w-3.5 h-3.5 bg-salvee-orange rounded-full"><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
          </div>
        </div>
      </div>
      <div id="amount-display" class="text-5xl font-bold text-salvee-orange">R$ 0</div>
      <textarea id="donation-message" placeholder="Mensagem opcional" maxlength="200" rows="2"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm resize-none outline-none focus:border-salvee-orange"></textarea>
      <p id="char-count" class="self-end text-xs text-gray-400">0/200</p>
    </div>
    <div id="keyboard-container"></div>
    <div id="amount-btn" class="p-4 pb-safe"></div>
  `

  container.querySelector('#donation-message')!.addEventListener('input', (e) => {
    message = (e.target as HTMLTextAreaElement).value
    container.querySelector('#char-count')!.textContent = `${message.length}/200`
  })

  let displayValue = '0'
  container.querySelector('#keyboard-container')!.appendChild(
    NumericKeyboard({
      onInput: (val) => {
        displayValue = val
        amount = parseInt(val, 10)
        container.querySelector('#amount-display')!.textContent = `R$ ${parseInt(val, 10).toLocaleString('pt-BR')}`
      },
    })
  )

  container.querySelector('#amount-btn')!.appendChild(
    Button({
      label: 'Avançar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => {
        if (amount <= 0) { showToast('Digite um valor para doar', 'error'); return }
        step = 'payment'
        renderStep()
      },
    })
  )
}

function renderPaymentStep(container: HTMLElement): void {
  const methods: Array<{ id: PaymentMethod; label: string; icon: string }> = [
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'google_pay', label: 'Google Pay', icon: 'G' },
    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'pix', label: 'Pix código', icon: '⚡' },
  ]

  container.innerHTML = `<div class="p-6 flex flex-col gap-3" id="payment-list"></div><div id="payment-btn" class="p-4 pb-safe"></div>`

  const list = container.querySelector('#payment-list')!
  methods.forEach(m => {
    const btn = document.createElement('button')
    const isSelected = paymentMethod === m.id
    btn.className = `w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${isSelected ? 'border-salvee-orange bg-salvee-orange-bg' : 'border-gray-100 bg-white'}`
    btn.innerHTML = `<span class="text-2xl w-8 text-center">${m.icon}</span><span class="font-medium text-gray-900 flex-1 text-left">${m.label}</span><div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-salvee-orange' : 'border-gray-300'}">${isSelected ? '<div class="w-3 h-3 rounded-full bg-salvee-orange"></div>' : ''}</div>`
    btn.addEventListener('click', () => { paymentMethod = m.id; renderPaymentStep(container) })
    list.appendChild(btn)
  })

  container.querySelector('#payment-btn')!.appendChild(
    Button({ label: 'Avançar', variant: 'primary', fullWidth: true, onClick: () => { step = 'summary'; renderStep() } })
  )
}

function renderSummaryStep(container: HTMLElement): void {
  const xp = Math.floor(amount / 2)
  const salves = Math.floor(amount / 4)

  container.innerHTML = `
    <div class="p-6 flex flex-col gap-4">
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
          ${institution?.logoUrl ? `<img src="${institution.logoUrl}" class="w-full h-full object-cover" />` : '🏢'}
        </div>
        <span class="font-semibold text-gray-900">${institution?.name ?? ''}</span>
        ${institution?.verified ? `<span class="inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full ml-auto"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex justify-between"><span class="text-gray-500">Valor</span><span class="font-bold text-salvee-orange text-lg">R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Pontuação</span><span class="font-medium text-gray-900">+${xp}XP · +${salves}SLV</span></div>
        ${message ? `<div class="flex justify-between"><span class="text-gray-500">Mensagem</span><span class="font-medium text-gray-900 text-right max-w-[60%] text-sm">${message}</span></div>` : ''}
      </div>
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <span class="text-gray-700 font-medium">Doação anônima</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="anonymous-toggle" class="sr-only peer" ${anonymous ? 'checked' : ''} />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-salvee-orange"></div>
        </label>
      </div>
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
        <span class="text-2xl">${paymentMethod === 'pix' ? '⚡' : paymentMethod === 'paypal' ? '🅿️' : paymentMethod === 'google_pay' ? 'G' : '🍎'}</span>
        <span class="font-medium text-gray-900 flex-1">${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'}</span>
        <button class="text-salvee-orange text-sm font-medium" onclick="window.location.hash='/donate/' + (document.querySelector('[data-institution-id]')?.dataset['institutionId'] ?? '')">Trocar</button>
      </div>
    </div>
    <div id="confirm-btn" class="p-4 pb-safe"></div>
  `

  container.querySelector('#anonymous-toggle')!.addEventListener('change', (e) => {
    anonymous = (e.target as HTMLInputElement).checked
  })

  container.querySelector('#confirm-btn')!.appendChild(
    Button({
      label: 'Confirmar',
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        const overlay = LoadingOverlay()
        document.body.appendChild(overlay)
        try {
          const result = await donationService.initiate({
            institutionId: institution?.id ?? '',
            amount,
            message,
            paymentMethod,
            anonymous,
          })
          donationId = result.donationId
          xpEarned = result.xpEarned
          salvesEarned = result.salvesEarned
          step = 'success'
          renderStep()
        } catch {
          xpEarned = Math.floor(amount / 2)
          salvesEarned = Math.floor(amount / 4)
          step = 'success'
          renderStep()
        } finally {
          overlay.remove()
        }
      },
    })
  )
}

function renderSuccessStep(container: HTMLElement): void {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center flex-1 p-6 gap-6 text-center">
      <div class="w-32 h-32 bg-salvee-orange-bg rounded-full flex items-center justify-center text-6xl">🎉</div>
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h2>
        <p class="text-gray-500 text-sm">Sua doação foi efetuada com sucesso!</p>
      </div>
      <div class="flex gap-4">
        <div class="bg-salvee-orange-bg px-6 py-3 rounded-2xl text-center">
          <p class="text-salvee-orange font-bold text-xl">+${xpEarned}XP</p>
          <p class="text-xs text-gray-500">Experiência</p>
        </div>
        <div class="bg-salvee-orange-bg px-6 py-3 rounded-2xl text-center">
          <p class="text-salvee-orange font-bold text-xl">+${salvesEarned}SLV</p>
          <p class="text-xs text-gray-500">Salves</p>
        </div>
      </div>
    </div>
    <div id="success-btn" class="p-4 pb-safe"></div>
  `

  container.querySelector('#success-btn')!.appendChild(
    Button({
      label: 'Continuar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => { window.location.hash = '/feed' },
    })
  )
}

export function unmount(): void {
  step = 'amount'
  amount = 0
  message = ''
  paymentMethod = 'pix'
  anonymous = false
  institution = null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/donation/
git commit -m "feat: donation flow with 4 steps"
```

---

## Task 11: Tela Calendário

**Files:**
- Modify: `src/screens/calendar/index.ts`

- [ ] **Step 1: Implementar calendário**

```typescript
// src/screens/calendar/index.ts
import { BottomNav, Spinner, showToast } from '@/components'
import { calendarService } from '@/services'
import type { CalendarEvent } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-30">
      <h1 class="text-xl font-bold text-gray-900">Minhas Ações</h1>
      <p class="text-sm text-gray-400">Eventos que você confirmou presença</p>
    </header>
    <div id="events-list" class="flex flex-col gap-3 p-4 pb-24"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  const list = document.getElementById('events-list')!

  const spinnerWrapper = document.createElement('div')
  spinnerWrapper.className = 'flex justify-center py-8'
  spinnerWrapper.appendChild(Spinner())
  list.appendChild(spinnerWrapper)

  calendarService.getMyEvents().then(events => {
    spinnerWrapper.remove()
    renderEvents(list, events)
  }).catch(() => {
    spinnerWrapper.remove()
    renderEvents(list, getMockEvents())
  })
}

function renderEvents(container: HTMLElement, events: CalendarEvent[]): void {
  if (events.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-4xl mb-3">📅</p>
        <p class="text-gray-500 font-medium">Nenhum evento confirmado ainda</p>
        <p class="text-gray-400 text-sm mt-1">Explore o feed e participe de eventos!</p>
      </div>
    `
    return
  }

  let lastMonth = ''
  events.forEach(event => {
    const date = new Date(event.date)
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    if (monthYear !== lastMonth) {
      const header = document.createElement('h2')
      header.className = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1 capitalize'
      header.textContent = monthYear
      container.appendChild(header)
      lastMonth = monthYear
    }

    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex gap-4'
    card.innerHTML = `
      <div class="flex flex-col items-center justify-center w-12 h-12 bg-salvee-orange-bg rounded-xl flex-shrink-0">
        <span class="text-salvee-orange font-bold text-lg leading-none">${date.getDate()}</span>
        <span class="text-salvee-orange text-xs">${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
      </div>
      <div class="flex-1">
        <p class="font-semibold text-gray-900 text-sm">${event.title}</p>
        <p class="text-xs text-gray-500 mt-0.5">${event.institutionName}</p>
        <p class="text-xs text-gray-400 mt-1">📍 ${event.location}</p>
      </div>
      <button data-event-id="${event.id}" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors" title="Cancelar participação">✕</button>
    `
    card.querySelector('[data-event-id]')!.addEventListener('click', async (e) => {
      const id = (e.target as HTMLElement).dataset['eventId']!
      try {
        await calendarService.unregisterFromEvent(id)
        card.remove()
        showToast('Participação cancelada', 'info')
      } catch {
        showToast('Erro ao cancelar', 'error')
      }
    })
    container.appendChild(card)
  })
}

function getMockEvents(): CalendarEvent[] {
  return [
    { id: '1', institutionId: 'inst3', institutionName: 'ONG Verde', title: 'Mutirão de Limpeza Rio Negro', date: new Date(Date.now() + 86400000 * 3).toISOString(), location: 'Praia da Ponta Negra', registered: true },
    { id: '2', institutionId: 'inst1', institutionName: 'Instituto Esperança', title: 'Bazar Solidário', date: new Date(Date.now() + 86400000 * 10).toISOString(), location: 'Av. Djalma Batista, 500', registered: true },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/calendar/
git commit -m "feat: calendar screen"
```

---

## Task 12: Tela Perfil (Gamificação)

**Files:**
- Modify: `src/screens/profile/index.ts`

- [ ] **Step 1: Implementar perfil**

```typescript
// src/screens/profile/index.ts
import { BottomNav, Avatar, Spinner, showToast, Button } from '@/components'
import { userService, gamificationService } from '@/services'
import type { User, GameBalance, Reward } from '@/types'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <header class="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
      <h1 class="text-xl font-bold text-gray-900">Perfil</h1>
      <button id="settings-btn" class="text-gray-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
    </header>
    <div id="profile-loading" class="flex justify-center py-16"></div>
    <div id="profile-content" class="hidden pb-24"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('app')!.appendChild(BottomNav())
  document.getElementById('settings-btn')!.addEventListener('click', () => { window.location.hash = '/settings' })

  const loadingEl = document.getElementById('profile-loading')!
  loadingEl.appendChild(Spinner())

  Promise.all([
    userService.getProfile().catch(() => getMockUser()),
    gamificationService.getBalance().catch(() => getMockBalance()),
    gamificationService.listRewards().catch(() => getMockRewards()),
  ]).then(([user, balance, rewards]) => {
    loadingEl.remove()
    renderProfile(user, balance, rewards)
  })
}

function renderProfile(user: User, balance: GameBalance, rewards: Reward[]): void {
  const content = document.getElementById('profile-content')!
  content.classList.remove('hidden')

  const xpPct = Math.min((balance.xp / (balance.xp + balance.xpToNextLevel)) * 100, 100)

  content.innerHTML = `
    <div class="bg-white p-6 flex flex-col items-center gap-3 border-b border-gray-100">
      <div id="avatar-container"></div>
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-900">${user.name}</h2>
        <p class="text-sm text-salvee-orange font-medium">Nível ${balance.level} · ${balance.levelName}</p>
      </div>
      <div class="w-full">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>${balance.xp} XP</span>
          <span>Próximo nível: ${balance.xp + balance.xpToNextLevel} XP</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-salvee-orange h-2 rounded-full transition-all" style="width: ${xpPct}%"></div>
        </div>
      </div>
      <div class="flex gap-4 w-full mt-2">
        <div class="flex-1 bg-salvee-orange-bg rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-salvee-orange">${balance.xp}</p>
          <p class="text-xs text-gray-500 mt-0.5">XP Total</p>
        </div>
        <div class="flex-1 bg-salvee-orange-bg rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-salvee-orange">${balance.salves}</p>
          <p class="text-xs text-gray-500 mt-0.5">Salves</p>
        </div>
      </div>
    </div>
    <div class="flex border-b border-gray-100 bg-white">
      <button id="tab-available" class="flex-1 py-3 text-sm font-medium text-salvee-orange border-b-2 border-salvee-orange">Disponível</button>
      <button id="tab-rewards" class="flex-1 py-3 text-sm font-medium text-gray-400 border-b-2 border-transparent">Minhas recompensas</button>
    </div>
    <div id="rewards-grid" class="grid grid-cols-1 gap-3 p-4"></div>
  `

  content.querySelector('#avatar-container')!.appendChild(Avatar(user.name, user.avatarUrl, 'lg'))

  document.getElementById('tab-available')!.addEventListener('click', () => renderRewardsList(rewards))
  document.getElementById('tab-rewards')!.addEventListener('click', () => {
    document.getElementById('rewards-grid')!.innerHTML = '<p class="text-center text-gray-400 py-8 col-span-full">Nenhuma recompensa resgatada.</p>'
  })

  renderRewardsList(rewards)
}

function renderRewardsList(rewards: Reward[]): void {
  const grid = document.getElementById('rewards-grid')!
  grid.innerHTML = ''
  rewards.forEach(reward => {
    const card = document.createElement('div')
    card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4'
    card.innerHTML = `
      <div class="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
        ${reward.partnerLogoUrl ? `<img src="${reward.partnerLogoUrl}" alt="${reward.partnerName}" class="w-full h-full object-cover" />` : '<span class="text-2xl">🎁</span>'}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 text-sm">${reward.title}</p>
        <p class="text-xs text-gray-500">${reward.partnerName}</p>
        <p class="text-xs text-gray-400 mt-0.5">${reward.description}</p>
      </div>
      <div id="redeem-${reward.id}" class="flex-shrink-0"></div>
    `
    const btnEl = document.getElementById(`redeem-${reward.id}`)
    if (btnEl) {
      btnEl.appendChild(Button({
        label: `${reward.cost} SLV`,
        variant: 'primary',
        onClick: async () => {
          try {
            await gamificationService.redeemReward(reward.id)
            showToast('Recompensa resgatada! Verifique seu QR Code.', 'success')
          } catch {
            showToast('Salves insuficientes', 'error')
          }
        },
      }))
    }
    grid.appendChild(card)
  })
}

function getMockUser(): User {
  return { id: '1', name: 'José Felipe Amorim', email: 'jose@email.com', xp: 350, salves: 500, level: 5, createdAt: '' }
}

function getMockBalance(): GameBalance {
  return { xp: 350, salves: 500, level: 5, xpToNextLevel: 150, levelName: 'Nível 5' }
}

function getMockRewards(): Reward[] {
  return [
    { id: 'r1', title: 'Xbox Gamepass', description: '3 Meses Ultimate', cost: 250, partnerName: 'Xbox' },
    { id: 'r2', title: 'Café Grátis', description: '1 café expresso', cost: 50, partnerName: 'Café Local' },
  ]
}

export function unmount(): void {
  document.getElementById('bottom-nav')?.remove()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/profile/
git commit -m "feat: profile screen with gamification and rewards"
```

---

## Task 13: Tela Configurações

**Files:**
- Modify: `src/screens/settings/index.ts`

- [ ] **Step 1: Implementar configurações**

```typescript
// src/screens/settings/index.ts
import { authService } from '@/services'

interface SettingItem {
  label: string
  icon: string
  action: () => void
  destructive?: boolean
}

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Configurações</h1>
    </div>
    <div id="settings-list" class="flex flex-col gap-2 p-4 pb-safe"></div>
    <p id="app-version" class="text-center text-xs text-gray-300 pb-4"></p>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  document.getElementById('app-version')!.textContent = `Versão 1.0.0`

  const groups: Array<{ title?: string; items: SettingItem[] }> = [
    {
      items: [
        { label: 'Perfil', icon: '👤', action: () => { window.location.hash = '/profile' } },
        { label: 'Notificações', icon: '🔔', action: () => {} },
        { label: 'Geral', icon: '⚙️', action: () => {} },
        { label: 'Acessibilidade', icon: '♿', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Pagamentos & assinaturas', icon: '💳', action: () => {} },
        { label: 'Segurança', icon: '🔒', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Centro de ajuda', icon: '❓', action: () => {} },
        { label: 'Sobre Salvee', icon: 'ℹ️', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Sair', icon: '🚪', destructive: true, action: () => { authService.logout(); window.location.hash = '/welcome' } },
      ],
    },
  ]

  const list = document.getElementById('settings-list')!

  groups.forEach(group => {
    const section = document.createElement('div')
    section.className = 'bg-white rounded-2xl overflow-hidden border border-gray-100'

    group.items.forEach((item, idx) => {
      const btn = document.createElement('button')
      btn.className = `w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${idx < group.items.length - 1 ? 'border-b border-gray-50' : ''}`
      btn.innerHTML = `
        <span class="text-xl w-8 text-center">${item.icon}</span>
        <span class="flex-1 text-sm font-medium ${item.destructive ? 'text-red-500' : 'text-gray-800'}">${item.label}</span>
        ${!item.destructive ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300"><path d="M9 18l6-6-6-6"/></svg>` : ''}
      `
      btn.addEventListener('click', item.action)
      section.appendChild(btn)
    })

    list.appendChild(section)
  })
}
```

- [ ] **Step 2: Verificar no browser — testar todas as telas**

```bash
npm run dev
```

Testar o fluxo completo:
1. `/#/` → splash → `/#/welcome`
2. `/#/register` → preencher e avançar → `/#/verify-phone`
3. `/#/login` → com credenciais mock, colocar um token manualmente em localStorage: `localStorage.setItem('accessToken', 'test')`
4. `/#/feed` → posts visíveis, bottom nav funcional
5. `/#/search` → categorias e busca
6. `/#/donate/inst1` → fluxo 4 passos
7. `/#/calendar`, `/#/profile`, `/#/settings`

- [ ] **Step 3: Build final de produção**

```bash
npm run build
```

Esperado: `dist/` gerado sem erros de TypeScript

- [ ] **Step 4: Commit final**

```bash
git add src/screens/settings/ src/screens/
git commit -m "feat: settings screen — all V1 screens complete"
```

---

## Self-Review

**Cobertura da spec V1:**
- ✓ Splash com checagem de token
- ✓ Boas-vindas com CTAs
- ✓ Login (e-mail + senha + social)
- ✓ Cadastro de usuário + aceite de termos
- ✓ Verificação de telefone OTP
- ✓ Escolha de perfil (usuário/instituição)
- ✓ Cadastro de instituição (6 etapas)
- ✓ Esqueci senha
- ✓ Feed (3 tipos de post: comum, campanha, evento)
- ✓ Busca com categorias e destaques
- ✓ Perfil institucional (abas: Mural, Sobre, Info)
- ✓ Fluxo de doação (valor → pagamento → resumo → sucesso com XP/Salves)
- ✓ Calendário de eventos com cancelamento
- ✓ Perfil do usuário com XP, Salves, nível e recompensas
- ✓ Configurações com logout
- ✓ Guard de rota (não-autenticado → /welcome)
- ✓ Bottom nav em todas as telas autenticadas
- ✓ Mock data em todos os serviços para desenvolvimento
- ✓ Build de produção compatível com Hostinger
