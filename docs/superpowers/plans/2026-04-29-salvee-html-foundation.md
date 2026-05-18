# Salvee HTML — Plano 1: Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o scaffold completo do projeto salvee-html com Vite + TypeScript + Tailwind, incluindo sistema de tipos, camada de serviços, router hash e todos os componentes reutilizáveis — pronto para receber as telas do Plano 2.

**Architecture:** Single Page App manual com hash routing. Cada tela é um módulo TS que exporta `render(): HTMLElement`. Serviços isolados em `src/services/` com interfaces tipadas prontas para conectar uma API REST. Componentes em `src/components/` como funções puras que retornam `HTMLElement`.

**Tech Stack:** Vite 5, TypeScript 5, Tailwind CSS 3, Vitest, Lucide Icons

---

## Mapa de Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Shell único — monta `<div id="app">` |
| `src/main.ts` | Ponto de entrada — instancia o router |
| `src/router.ts` | Hash router: mapeia `/#/rota` → tela |
| `src/types/*.ts` | Interfaces TypeScript de domínio |
| `src/services/api.ts` | `request<T>()` base com JWT e BASE_URL |
| `src/services/*.service.ts` | Um arquivo por domínio (auth, feed, etc.) |
| `src/components/*.ts` | Componentes reutilizáveis como funções |
| `src/styles/global.css` | Tailwind base + tokens de cor Salvee |
| `tailwind.config.ts` | Tokens customizados (salvee-orange etc.) |
| `vite.config.ts` | Config Vite com alias `@/` para `src/` |

---

## Task 1: Inicializar scaffold Vite + TypeScript

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`

- [ ] **Step 1: Criar o projeto**

```bash
cd "C:/Users/hkmju/OneDrive/Área de Trabalho"
npm create vite@latest salvee-html -- --template vanilla-ts
cd salvee-html
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install
npm install -D vitest @vitest/ui
npm install lucide
```

- [ ] **Step 3: Configurar vite.config.ts**

Substituir o conteúdo de `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 4: Configurar tsconfig.json**

Substituir o conteúdo de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Criar .env.example**

```
VITE_API_URL=https://seudominio.com/api
```

- [ ] **Step 6: Criar .env local**

```
VITE_API_URL=http://localhost:8000/api
```

- [ ] **Step 7: Verificar que o projeto sobe**

```bash
npm run dev
```

Esperado: servidor rodando em `http://localhost:5173`

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite + typescript"
```

---

## Task 2: Configurar Tailwind CSS com tokens Salvee

**Files:**
- Create: `tailwind.config.ts`, `src/styles/global.css`
- Modify: `index.html`

- [ ] **Step 1: Instalar Tailwind**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

- [ ] **Step 2: Configurar tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,html}'],
  theme: {
    extend: {
      colors: {
        salvee: {
          orange: '#FF6B00',
          'orange-light': '#FF8533',
          'orange-bg': '#FFF3EC',
          'orange-dark': '#CC5500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '390px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Criar src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body {
    @apply h-full m-0 p-0 bg-gray-100 font-sans;
  }

  #app {
    @apply max-w-app mx-auto min-h-full bg-white relative overflow-x-hidden;
  }
}

@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }
  .screen {
    @apply min-h-screen flex flex-col;
  }
}
```

- [ ] **Step 4: Atualizar index.html**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="theme-color" content="#FF6B00" />
    <title>Salvee</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Atualizar src/main.ts temporariamente para testar Tailwind**

```typescript
import '@/styles/global.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="p-4">
    <h1 class="text-2xl font-bold text-salvee-orange">Salvee</h1>
    <p class="text-gray-600">Tailwind funcionando!</p>
  </div>
`
```

- [ ] **Step 6: Verificar visual**

```bash
npm run dev
```

Esperado: texto "Salvee" em laranja `#FF6B00` centralizado no `max-w-app`

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: configure tailwind with salvee tokens"
```

---

## Task 3: Definir tipos TypeScript

**Files:**
- Create: `src/types/user.ts`, `src/types/institution.ts`, `src/types/post.ts`, `src/types/donation.ts`, `src/types/gamification.ts`, `src/types/index.ts`

- [ ] **Step 1: Criar src/types/user.ts**

```typescript
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  xp: number
  salves: number
  level: number
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}
```

- [ ] **Step 2: Criar src/types/institution.ts**

```typescript
export type InstitutionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision'

export interface Institution {
  id: string
  name: string
  category: string
  subcategory?: string
  description: string
  logoUrl?: string
  photos: string[]
  verified: boolean
  status: InstitutionStatus
  address?: Address
  cnpj?: string
  phone?: string
  email?: string
  mission?: string
  foundedYear?: number
  history?: string
}

export interface Address {
  street: string
  number: string
  city: string
  state: string
  zipCode: string
  lat?: number
  lng?: number
}

export interface InstitutionRegisterPayload {
  step: number
  data: Record<string, unknown>
}
```

- [ ] **Step 3: Criar src/types/post.ts**

```typescript
export type PostType = 'common' | 'campaign' | 'event'

export interface Post {
  id: string
  institutionId: string
  institutionName: string
  institutionLogoUrl?: string
  institutionVerified: boolean
  type: PostType
  content: string
  imageUrl?: string
  createdAt: string
  // campaign fields
  campaignGoal?: number
  campaignCurrent?: number
  // event fields
  eventDate?: string
  eventLocation?: string
}
```

- [ ] **Step 4: Criar src/types/donation.ts**

```typescript
export type PaymentMethod = 'pix' | 'paypal' | 'google_pay' | 'apple_pay' | 'card'

export interface Donation {
  id: string
  institutionId: string
  institutionName: string
  amount: number
  message?: string
  paymentMethod: PaymentMethod
  anonymous: boolean
  xpEarned: number
  salvesEarned: number
  createdAt: string
}

export interface DonationInitPayload {
  institutionId: string
  amount: number
  message?: string
  paymentMethod: PaymentMethod
  anonymous: boolean
}

export interface DonationResult {
  donationId: string
  xpEarned: number
  salvesEarned: number
  pixCode?: string
}
```

- [ ] **Step 5: Criar src/types/gamification.ts**

```typescript
export interface GameBalance {
  xp: number
  salves: number
  level: number
  xpToNextLevel: number
  levelName: string
}

export interface Reward {
  id: string
  title: string
  description: string
  cost: number
  partnerName: string
  partnerLogoUrl?: string
  expiresAt?: string
}

export interface RedemptionResult {
  qrCode: string
  expiresAt: string
}

export interface CalendarEvent {
  id: string
  institutionId: string
  institutionName: string
  title: string
  date: string
  location: string
  registered: boolean
}
```

- [ ] **Step 6: Criar src/types/index.ts**

```typescript
export * from './user'
export * from './institution'
export * from './post'
export * from './donation'
export * from './gamification'
```

- [ ] **Step 7: Commit**

```bash
git add src/types/
git commit -m "feat: add typescript domain types"
```

---

## Task 4: Camada de serviços — base e auth

**Files:**
- Create: `src/services/api.ts`, `src/services/auth.service.ts`
- Create: `src/tests/services/auth.service.test.ts`

- [ ] **Step 1: Escrever teste para api.ts**

Criar `src/tests/services/api.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    import.meta.env.VITE_API_URL = 'http://test.api'
  })

  it('calls correct URL with JSON headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    })

    const { request } = await import('@/services/api')
    const result = await request<{ id: string }>('/users/1')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.api/users/1',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
    expect(result).toEqual({ id: '1' })
  })

  it('injects Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'my-token')
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const { request } = await import('@/services/api')
    await request('/protected')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      })
    )
  })

  it('throws error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })

    const { request } = await import('@/services/api')
    await expect(request('/protected')).rejects.toThrow('Unauthorized')
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FAIL**

```bash
npx vitest run src/tests/services/api.test.ts
```

Esperado: FAIL — `Cannot find module '@/services/api'`

- [ ] **Step 3: Criar src/services/api.ts**

```typescript
const BASE_URL = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? 'Erro desconhecido')
  }

  return data as T
}
```

- [ ] **Step 4: Rodar teste — verificar PASS**

```bash
npx vitest run src/tests/services/api.test.ts
```

Esperado: PASS (3 testes)

- [ ] **Step 5: Criar src/services/auth.service.ts**

```typescript
import { request } from './api'
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens
  },

  async forgotPassword(email: string): Promise<void> {
    await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async verifyPhone(phone: string, code: string): Promise<void> {
    await request('/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })
  },

  async sendPhoneCode(phone: string): Promise<void> {
    await request('/auth/send-phone-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  },

  logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me')
  },
}
```

- [ ] **Step 6: Commit**

```bash
git add src/services/ src/tests/
git commit -m "feat: add api base and auth service"
```

---

## Task 5: Serviços restantes

**Files:**
- Create: `src/services/feed.service.ts`, `src/services/institution.service.ts`, `src/services/donation.service.ts`, `src/services/search.service.ts`, `src/services/gamification.service.ts`, `src/services/calendar.service.ts`, `src/services/user.service.ts`, `src/services/index.ts`

- [ ] **Step 1: Criar src/services/feed.service.ts**

```typescript
import { request } from './api'
import type { Post } from '@/types'

export const feedService = {
  async listPosts(page = 1): Promise<Post[]> {
    return request<Post[]>(`/feed?page=${page}`)
  },

  async getPostById(id: string): Promise<Post> {
    return request<Post>(`/posts/${id}`)
  },
}
```

- [ ] **Step 2: Criar src/services/institution.service.ts**

```typescript
import { request } from './api'
import type { Institution, InstitutionRegisterPayload } from '@/types'

export const institutionService = {
  async getById(id: string): Promise<Institution> {
    return request<Institution>(`/institutions/${id}`)
  },

  async list(params?: { category?: string; page?: number }): Promise<Institution[]> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return request<Institution[]>(`/institutions${qs ? `?${qs}` : ''}`)
  },

  async search(query: string): Promise<Institution[]> {
    return request<Institution[]>(`/institutions/search?q=${encodeURIComponent(query)}`)
  },

  async registerStep(payload: InstitutionRegisterPayload): Promise<{ institutionId: string }> {
    return request('/institutions/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async uploadDocs(institutionId: string, files: FormData): Promise<void> {
    const token = localStorage.getItem('accessToken')
    await fetch(`${import.meta.env.VITE_API_URL}/institutions/${institutionId}/docs`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: files,
    })
  },
}
```

- [ ] **Step 3: Criar src/services/donation.service.ts**

```typescript
import { request } from './api'
import type { Donation, DonationInitPayload, DonationResult } from '@/types'

export const donationService = {
  async initiate(payload: DonationInitPayload): Promise<DonationResult> {
    return request<DonationResult>('/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async confirm(donationId: string): Promise<Donation> {
    return request<Donation>(`/donations/${donationId}/confirm`, {
      method: 'POST',
    })
  },

  async getHistory(): Promise<Donation[]> {
    return request<Donation[]>('/donations/history')
  },
}
```

- [ ] **Step 4: Criar src/services/search.service.ts**

```typescript
import { request } from './api'
import type { Institution } from '@/types'

export interface Category {
  id: string
  name: string
  icon: string
}

export const searchService = {
  async search(query: string): Promise<Institution[]> {
    return request<Institution[]>(`/search?q=${encodeURIComponent(query)}`)
  },

  async listCategories(): Promise<Category[]> {
    return request<Category[]>('/categories')
  },

  async getNearby(lat: number, lng: number): Promise<Institution[]> {
    return request<Institution[]>(`/institutions/nearby?lat=${lat}&lng=${lng}`)
  },
}
```

- [ ] **Step 5: Criar src/services/gamification.service.ts**

```typescript
import { request } from './api'
import type { GameBalance, Reward, RedemptionResult } from '@/types'

export const gamificationService = {
  async getBalance(): Promise<GameBalance> {
    return request<GameBalance>('/gamification/balance')
  },

  async listRewards(): Promise<Reward[]> {
    return request<Reward[]>('/gamification/rewards')
  },

  async redeemReward(rewardId: string): Promise<RedemptionResult> {
    return request<RedemptionResult>(`/gamification/rewards/${rewardId}/redeem`, {
      method: 'POST',
    })
  },
}
```

- [ ] **Step 6: Criar src/services/calendar.service.ts**

```typescript
import { request } from './api'
import type { CalendarEvent } from '@/types'

export const calendarService = {
  async getMyEvents(): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>('/calendar/my-events')
  },

  async registerForEvent(eventId: string): Promise<void> {
    await request(`/events/${eventId}/register`, { method: 'POST' })
  },

  async unregisterFromEvent(eventId: string): Promise<void> {
    await request(`/events/${eventId}/unregister`, { method: 'DELETE' })
  },
}
```

- [ ] **Step 7: Criar src/services/user.service.ts**

```typescript
import { request } from './api'
import type { User } from '@/types'

export const userService = {
  async getProfile(): Promise<User> {
    return request<User>('/users/me')
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'phone'>>): Promise<User> {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData()
    form.append('avatar', file)
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    return res.json()
  },
}
```

- [ ] **Step 8: Criar src/services/index.ts**

```typescript
export { authService } from './auth.service'
export { feedService } from './feed.service'
export { institutionService } from './institution.service'
export { donationService } from './donation.service'
export { searchService } from './search.service'
export { gamificationService } from './gamification.service'
export { calendarService } from './calendar.service'
export { userService } from './user.service'
```

- [ ] **Step 9: Commit**

```bash
git add src/services/
git commit -m "feat: add all domain services"
```

---

## Task 6: Hash Router

**Files:**
- Create: `src/router.ts`
- Create: `src/tests/router.test.ts`

- [ ] **Step 1: Escrever teste para o router**

Criar `src/tests/router.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Router', () => {
  beforeEach(() => {
    window.location.hash = ''
    localStorage.clear()
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('redirects unauthenticated user to /welcome', async () => {
    const { Router } = await import('@/router')
    const router = new Router()
    router.navigate('/#/feed')
    expect(window.location.hash).toBe('#/welcome')
  })

  it('parses route params from hash', async () => {
    const { parseParams } = await import('@/router')
    const params = parseParams('/#/institution/:id', '/#/institution/abc-123')
    expect(params).toEqual({ id: 'abc-123' })
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FAIL**

```bash
npx vitest run src/tests/router.test.ts
```

Esperado: FAIL

- [ ] **Step 3: Criar src/router.ts**

```typescript
import { authService } from '@/services'

export type ScreenModule = {
  render: (params?: Record<string, string>) => HTMLElement
  mount?: () => void
  unmount?: () => void
}

type RouteDefinition = {
  path: string
  load: () => Promise<ScreenModule>
  protected?: boolean
}

const ROUTES: RouteDefinition[] = [
  { path: '/', load: () => import('@/screens/splash') },
  { path: '/welcome', load: () => import('@/screens/welcome') },
  { path: '/login', load: () => import('@/screens/auth/login') },
  { path: '/register', load: () => import('@/screens/auth/register') },
  { path: '/register/institution', load: () => import('@/screens/onboarding/institution-register'), protected: true },
  { path: '/verify-phone', load: () => import('@/screens/onboarding/verify-phone') },
  { path: '/choose-profile', load: () => import('@/screens/onboarding/choose-profile') },
  { path: '/forgot-password', load: () => import('@/screens/auth/forgot-password') },
  { path: '/feed', load: () => import('@/screens/feed'), protected: true },
  { path: '/search', load: () => import('@/screens/search'), protected: true },
  { path: '/institution/:id', load: () => import('@/screens/institution-profile'), protected: true },
  { path: '/donate/:id', load: () => import('@/screens/donation'), protected: true },
  { path: '/calendar', load: () => import('@/screens/calendar'), protected: true },
  { path: '/profile', load: () => import('@/screens/profile'), protected: true },
  { path: '/settings', load: () => import('@/screens/settings'), protected: true },
]

export function parseParams(
  pattern: string,
  hash: string
): Record<string, string> {
  const patternParts = pattern.replace('/#', '').split('/')
  const hashParts = hash.replace('#', '').split('/')
  const params: Record<string, string> = {}
  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = hashParts[i] ?? ''
    }
  })
  return params
}

function matchRoute(hash: string): { route: RouteDefinition; params: Record<string, string> } | null {
  const path = hash.replace(/^#/, '') || '/'
  for (const route of ROUTES) {
    const patternParts = route.path.split('/')
    const pathParts = path.split('/')
    if (patternParts.length !== pathParts.length) continue
    const params: Record<string, string> = {}
    const match = patternParts.every((part, i) => {
      if (part.startsWith(':')) { params[part.slice(1)] = pathParts[i]; return true }
      return part === pathParts[i]
    })
    if (match) return { route, params }
  }
  return null
}

export class Router {
  private currentUnmount?: () => void
  private appEl: HTMLElement

  constructor() {
    this.appEl = document.getElementById('app')!
    window.addEventListener('hashchange', () => this.resolve())
  }

  navigate(hash: string): void {
    window.location.hash = hash.replace(/^#?\//, '')
    this.resolve()
  }

  async resolve(): Promise<void> {
    const hash = window.location.hash || '#/'
    const matched = matchRoute(hash)

    if (!matched) {
      window.location.hash = '/welcome'
      return
    }

    const { route, params } = matched

    if (route.protected && !authService.isAuthenticated()) {
      window.location.hash = '/welcome'
      return
    }

    if (this.currentUnmount) {
      this.currentUnmount()
      this.currentUnmount = undefined
    }

    const mod = await route.load()
    const el = mod.render(params)
    this.appEl.innerHTML = ''
    this.appEl.appendChild(el)

    if (mod.mount) {
      mod.mount()
      this.currentUnmount = mod.unmount
    }
  }
}
```

- [ ] **Step 4: Rodar teste — verificar PASS**

```bash
npx vitest run src/tests/router.test.ts
```

Esperado: PASS

- [ ] **Step 5: Commit**

```bash
git add src/router.ts src/tests/router.test.ts
git commit -m "feat: add hash router with route guards"
```

---

## Task 7: Componentes base (Button, Input, Spinner, Toast)

**Files:**
- Create: `src/components/Button.ts`, `src/components/Input.ts`, `src/components/Spinner.ts`, `src/components/Toast.ts`

- [ ] **Step 1: Criar src/components/Button.ts**

```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

export interface ButtonOptions {
  label: string
  variant?: ButtonVariant
  fullWidth?: boolean
  disabled?: boolean
  onClick?: (e: MouseEvent) => void
  type?: 'button' | 'submit'
  icon?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-salvee-orange text-white hover:bg-salvee-orange-dark active:scale-95',
  secondary: 'border-2 border-salvee-orange text-salvee-orange bg-white hover:bg-salvee-orange-bg',
  ghost: 'text-salvee-orange bg-transparent hover:bg-salvee-orange-bg',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
}

export function Button(options: ButtonOptions): HTMLButtonElement {
  const {
    label,
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    icon,
  } = options

  const btn = document.createElement('button')
  btn.type = type
  btn.disabled = disabled
  btn.className = [
    'px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150',
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  btn.innerHTML = icon
    ? `<span class="flex items-center justify-center gap-2">${icon}${label}</span>`
    : label

  if (onClick) btn.addEventListener('click', onClick)
  return btn
}
```

- [ ] **Step 2: Criar src/components/Input.ts**

```typescript
export interface InputOptions {
  id: string
  label: string
  type?: string
  placeholder?: string
  value?: string
  error?: string
  required?: boolean
  onInput?: (value: string) => void
}

export function Input(options: InputOptions): HTMLDivElement {
  const { id, label, type = 'text', placeholder = '', value = '', error, required, onInput } = options

  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-1'

  wrapper.innerHTML = `
    <label for="${id}" class="text-sm font-medium text-gray-700">
      ${label}${required ? ' <span class="text-red-500">*</span>' : ''}
    </label>
    <input
      id="${id}"
      type="${type}"
      placeholder="${placeholder}"
      value="${value}"
      class="w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} text-gray-900 text-base outline-none focus:border-salvee-orange transition-colors"
    />
    ${error ? `<span class="text-xs text-red-500">${error}</span>` : ''}
  `

  if (onInput) {
    const input = wrapper.querySelector('input')!
    input.addEventListener('input', () => onInput(input.value))
  }

  return wrapper
}

export function getInputValue(wrapper: HTMLElement, id: string): string {
  return (wrapper.querySelector(`#${id}`) as HTMLInputElement)?.value ?? ''
}
```

- [ ] **Step 3: Criar src/components/Spinner.ts**

```typescript
export function Spinner(size: 'sm' | 'md' | 'lg' = 'md'): HTMLDivElement {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const el = document.createElement('div')
  el.className = `${sizes[size]} border-4 border-gray-200 border-t-salvee-orange rounded-full animate-spin`
  return el
}

export function LoadingOverlay(): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 bg-white/80 flex items-center justify-center z-50'
  overlay.appendChild(Spinner('lg'))
  return overlay
}
```

- [ ] **Step 4: Criar src/components/Toast.ts**

```typescript
export type ToastType = 'success' | 'error' | 'info'

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const colors: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-salvee-orange',
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000): void {
  const existing = document.getElementById('salvee-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'salvee-toast'
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg max-w-xs w-full ${colors[type]} transition-all duration-300 opacity-0`
  toast.innerHTML = `<span class="font-bold">${icons[type]}</span> ${message}`

  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.replace('opacity-0', 'opacity-100'))

  setTimeout(() => {
    toast.classList.replace('opacity-100', 'opacity-0')
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add Button, Input, Spinner, Toast components"
```

---

## Task 8: Componentes de layout (Card, Avatar, Badge, BottomNav)

**Files:**
- Create: `src/components/Card.ts`, `src/components/Avatar.ts`, `src/components/Badge.ts`, `src/components/BottomNav.ts`

- [ ] **Step 1: Criar src/components/Card.ts**

```typescript
export function Card(children: HTMLElement | string, className = ''): HTMLDivElement {
  const card = document.createElement('div')
  card.className = `bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`
  if (typeof children === 'string') {
    card.innerHTML = children
  } else {
    card.appendChild(children)
  }
  return card
}
```

- [ ] **Step 2: Criar src/components/Avatar.ts**

```typescript
export function Avatar(name: string, imageUrl?: string, size: 'sm' | 'md' | 'lg' = 'md'): HTMLDivElement {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  const el = document.createElement('div')
  el.className = `${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-salvee-orange text-white font-semibold flex-shrink-0`

  if (imageUrl) {
    el.innerHTML = `<img src="${imageUrl}" alt="${name}" class="w-full h-full object-cover" />`
  } else {
    const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    el.textContent = initials
  }

  return el
}
```

- [ ] **Step 3: Criar src/components/Badge.ts**

```typescript
export function VerifiedBadge(): HTMLSpanElement {
  const badge = document.createElement('span')
  badge.className = 'inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full'
  badge.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
  badge.title = 'Instituição verificada'
  return badge
}
```

- [ ] **Step 4: Criar src/components/BottomNav.ts**

```typescript
type NavItem = { icon: string; label: string; hash: string }

const NAV_ITEMS: NavItem[] = [
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    label: 'Feed',
    hash: '#/feed',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    label: 'Buscar',
    hash: '#/search',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    label: 'Agenda',
    hash: '#/calendar',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    label: 'Perfil',
    hash: '#/profile',
  },
]

export function BottomNav(): HTMLElement {
  const nav = document.createElement('nav')
  nav.id = 'bottom-nav'
  nav.className = 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-100 flex items-center justify-around pb-safe z-40'

  NAV_ITEMS.forEach(item => {
    const btn = document.createElement('button')
    const isActive = window.location.hash === item.hash
    btn.className = `flex flex-col items-center gap-0.5 py-2 px-4 ${isActive ? 'text-salvee-orange' : 'text-gray-400'} transition-colors`
    btn.innerHTML = `${item.icon}<span class="text-[10px] font-medium">${item.label}</span>`
    btn.addEventListener('click', () => { window.location.hash = item.hash })
    nav.appendChild(btn)
  })

  return nav
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add Card, Avatar, Badge, BottomNav components"
```

---

## Task 9: Componentes complexos (ProgressBar, BottomSheet, NumericKeyboard)

**Files:**
- Create: `src/components/ProgressBar.ts`, `src/components/BottomSheet.ts`, `src/components/NumericKeyboard.ts`, `src/components/index.ts`

- [ ] **Step 1: Criar src/components/ProgressBar.ts**

```typescript
export function ProgressBar(current: number, goal: number, label = true): HTMLDivElement {
  const pct = Math.min(Math.round((current / goal) * 100), 100)
  const el = document.createElement('div')
  el.className = 'flex flex-col gap-1'
  el.innerHTML = `
    ${label ? `<div class="flex justify-between text-xs text-gray-500">
      <span>R$ ${current.toLocaleString('pt-BR')}</span>
      <span>Meta: R$ ${goal.toLocaleString('pt-BR')}</span>
    </div>` : ''}
    <div class="w-full bg-gray-100 rounded-full h-2">
      <div class="bg-salvee-orange h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
    </div>
    <span class="text-xs text-salvee-orange font-medium">${pct}% arrecadado</span>
  `
  return el
}
```

- [ ] **Step 2: Criar src/components/BottomSheet.ts**

```typescript
export interface BottomSheetOptions {
  title?: string
  content: HTMLElement
  onClose?: () => void
}

export function BottomSheet(options: BottomSheetOptions): { el: HTMLElement; close: () => void } {
  const { title, content, onClose } = options

  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 bg-black/40 z-50 flex items-end justify-center'

  const sheet = document.createElement('div')
  sheet.className = 'w-full max-w-app bg-white rounded-t-3xl p-6 pb-safe transform transition-transform duration-300 translate-y-full'

  sheet.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      ${title ? `<h3 class="text-lg font-semibold text-gray-900">${title}</h3>` : '<div></div>'}
      <button id="bs-close" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">✕</button>
    </div>
  `
  sheet.appendChild(content)
  overlay.appendChild(sheet)
  document.body.appendChild(overlay)

  requestAnimationFrame(() => sheet.classList.replace('translate-y-full', 'translate-y-0'))

  const close = () => {
    sheet.classList.replace('translate-y-0', 'translate-y-full')
    setTimeout(() => { overlay.remove(); onClose?.() }, 300)
  }

  sheet.querySelector('#bs-close')!.addEventListener('click', close)
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })

  return { el: overlay, close }
}
```

- [ ] **Step 3: Criar src/components/NumericKeyboard.ts**

```typescript
export interface NumericKeyboardOptions {
  onInput: (value: string) => void
}

export function NumericKeyboard(options: NumericKeyboardOptions): HTMLDivElement {
  let display = '0'

  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']

  const kb = document.createElement('div')
  kb.className = 'grid grid-cols-3 gap-2 p-4'

  keys.forEach(key => {
    const btn = document.createElement('button')
    btn.className = `h-14 rounded-2xl text-xl font-medium flex items-center justify-center transition-all active:scale-95 ${
      key === '✓' ? 'bg-salvee-orange text-white' :
      key === '⌫' ? 'bg-gray-100 text-gray-600' :
      'bg-gray-50 text-gray-900 hover:bg-gray-100'
    }`
    btn.textContent = key
    btn.addEventListener('click', () => {
      if (key === '⌫') {
        display = display.length > 1 ? display.slice(0, -1) : '0'
      } else if (key === '✓') {
        options.onInput(display)
        return
      } else {
        display = display === '0' ? key : display + key
        if (display.length > 8) return
      }
      options.onInput(display)
    })
    kb.appendChild(btn)
  })

  return kb
}
```

- [ ] **Step 4: Criar src/components/index.ts**

```typescript
export { Button } from './Button'
export { Input, getInputValue } from './Input'
export { Spinner, LoadingOverlay } from './Spinner'
export { showToast } from './Toast'
export { Card } from './Card'
export { Avatar } from './Avatar'
export { VerifiedBadge } from './Badge'
export { BottomNav } from './BottomNav'
export { ProgressBar } from './ProgressBar'
export { BottomSheet } from './BottomSheet'
export { NumericKeyboard } from './NumericKeyboard'
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add ProgressBar, BottomSheet, NumericKeyboard components"
```

---

## Task 10: main.ts e placeholders de telas

**Files:**
- Create: `src/main.ts`
- Create: placeholder `index.ts` em cada pasta de tela

- [ ] **Step 1: Criar placeholder para cada tela**

Criar os seguintes arquivos com conteúdo idêntico (substituindo `NomeDaTela` pelo nome correto):

`src/screens/splash/index.ts`:
```typescript
export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-salvee-orange'
  el.innerHTML = `<p class="text-white text-2xl font-bold">Carregando...</p>`
  return el
}
```

Criar o mesmo padrão (trocar apenas o texto) para:
- `src/screens/welcome/index.ts` — texto: `"Tela: Welcome"`
- `src/screens/auth/login.ts` — texto: `"Tela: Login"`
- `src/screens/auth/register.ts` — texto: `"Tela: Cadastro"`
- `src/screens/auth/forgot-password.ts` — texto: `"Tela: Esqueci Senha"`
- `src/screens/onboarding/choose-profile.ts` — texto: `"Tela: Escolha Perfil"`
- `src/screens/onboarding/verify-phone.ts` — texto: `"Tela: Verificar Telefone"`
- `src/screens/onboarding/institution-register/index.ts` — texto: `"Tela: Cadastro Instituição"`
- `src/screens/feed/index.ts` — texto: `"Tela: Feed"`
- `src/screens/search/index.ts` — texto: `"Tela: Busca"`
- `src/screens/institution-profile/index.ts` — texto: `"Tela: Perfil Institucional"`
- `src/screens/donation/index.ts` — texto: `"Tela: Doação"`
- `src/screens/calendar/index.ts` — texto: `"Tela: Calendário"`
- `src/screens/profile/index.ts` — texto: `"Tela: Perfil"`
- `src/screens/settings/index.ts` — texto: `"Tela: Configurações"`

- [ ] **Step 2: Criar src/main.ts**

```typescript
import '@/styles/global.css'
import { Router } from '@/router'

const router = new Router()

if (!window.location.hash || window.location.hash === '#') {
  window.location.hash = '/'
} else {
  router.resolve()
}
```

- [ ] **Step 3: Verificar que o app navega sem erros**

```bash
npm run dev
```

Abrir `http://localhost:5173` — deve redirecionar para `/#/welcome` e exibir "Tela: Welcome"
Testar manualmente: `/#/feed` deve redirecionar para `/#/welcome` (sem token)

- [ ] **Step 4: Rodar todos os testes**

```bash
npx vitest run
```

Esperado: todos os testes PASS

- [ ] **Step 5: Build de produção**

```bash
npm run build
```

Esperado: pasta `dist/` gerada sem erros de TypeScript

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "feat: wire main.ts and router with screen placeholders"
```

---

## Self-Review

**Cobertura da spec:**
- ✓ Scaffold Vite + TypeScript
- ✓ Tailwind com tokens Salvee (laranja, max-w-app)
- ✓ Todos os tipos de domínio (User, Institution, Post, Donation, Gamification)
- ✓ Camada de serviços para todos os domínios
- ✓ Router hash com guard de autenticação
- ✓ Todos os componentes reutilizáveis
- ✓ Placeholders para todas as 13 telas
- ✓ Build de produção funcional (hospedável na Hostinger)

**Próximo:** Plano 2 implementa todas as telas com conteúdo real.
