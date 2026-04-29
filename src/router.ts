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
  const path = hash.replace(/^#\/?/, '') || '/'
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
