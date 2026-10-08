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
  { path: '/institution-status', load: () => import('@/screens/onboarding/institution-status'), protected: true },
  { path: '/register/institution', load: () => import('@/screens/onboarding/institution-register'), protected: true },
  { path: '/verify-phone', load: () => import('@/screens/onboarding/verify-phone') },
  { path: '/welcome-success', load: () => import('@/screens/onboarding/welcome-success') },
  { path: '/choose-profile', load: () => import('@/screens/onboarding/choose-profile') },
  { path: '/oauth', load: () => import('@/screens/auth/oauth') },
  { path: '/reset-password', load: () => import('@/screens/auth/reset-password') },
  { path: '/verify-email', load: () => import('@/screens/auth/verify-email') },
  { path: '/forgot-password', load: () => import('@/screens/auth/forgot-password') },
  { path: '/feed', load: () => import('@/screens/feed'), protected: true },
  { path: '/search', load: () => import('@/screens/search'), protected: true },
  { path: '/institution/:id', load: () => import('@/screens/institution-profile'), protected: true },
  { path: '/donate/:id', load: () => import('@/screens/donation'), protected: true },
  { path: '/calendar', load: () => import('@/screens/calendar'), protected: true },
  { path: '/profile', load: () => import('@/screens/profile'), protected: true },
  { path: '/settings', load: () => import('@/screens/settings'), protected: true },
  { path: '/admin/institutions', load: () => import('@/screens/admin/institution-approvals'), protected: true },
  { path: '/admin/users', load: () => import('@/screens/admin/user-management'), protected: true },
  { path: '/post/new', load: () => import('@/screens/post-editor'), protected: true },
  { path: '/post/:id', load: () => import('@/screens/post-detail'), protected: true },
  { path: '/post/:id/edit', load: () => import('@/screens/post-editor'), protected: true },
  { path: '/admin/donations', load: () => import('@/screens/admin/donation-approvals'), protected: true },
]

export function getHashQuery(): URLSearchParams {
  const hash = window.location.hash
  const i = hash.indexOf('?')
  return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : '')
}

export function parseParams(
  pattern: string,
  path: string
): Record<string, string> {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')
  const params: Record<string, string> = {}
  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i] ?? ''
    }
  })
  return params
}

function matchRoute(hash: string): { route: RouteDefinition; params: Record<string, string> } | null {
  // ignora a query (#/login?erro=...): cada tela lê a sua com getHashQuery()
  const path = hash.replace(/^#\/?/, '').split('?')[0] || '/'
  // normalize: ensure leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  for (const route of ROUTES) {
    const patternParts = route.path.split('/')
    const pathParts = normalizedPath.split('/')
    if (patternParts.length !== pathParts.length) continue
    const params: Record<string, string> = {}
    const match = patternParts.every((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = pathParts[i]
        return true
      }
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
    window.addEventListener('hashchange', () => void this.resolve())
  }

  navigate(hash: string): void {
    window.location.hash = hash.startsWith('#') ? hash.slice(1) : hash
    void this.resolve()
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
      if (mod.unmount) {
        this.currentUnmount = mod.unmount
      }
    }
  }
}
