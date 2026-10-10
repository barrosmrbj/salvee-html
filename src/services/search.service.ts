import { request } from './api'
import type { Institution } from '@/types'

export interface SearchCategory {
  name: string
  count: number
}

export interface SearchCity {
  city: string
  state: string
}

/** campanha em andamento (busca e "Causas perto de você") */
export interface SearchCampaign {
  id: string
  title: string
  institutionId: string
  institutionName: string
  institutionLogoUrl: string | null
  category: string
  city: string
  state: string
  imageUrl: string | null
  goal: number
  current: number
  deadline: string | null
  /** perto: até 30 km pelo GPS, ou mesma cidade escolhida */
  nearby?: boolean
  /** só com GPS ligado e instituição com local no mapa */
  distanceKm?: number | null
}

export interface SearchResult {
  institutions: Institution[]
  campaigns: SearchCampaign[]
}

export const searchService = {
  /** termo e/ou categoria: instituições e campanhas (menos ajudadas primeiro) */
  async search(query: string, category?: string): Promise<SearchResult> {
    const qs = new URLSearchParams()
    if (query) qs.set('q', query)
    if (category) qs.set('category', category)
    return request<SearchResult>(`/search?${qs}`)
  },

  async listCategories(): Promise<SearchCategory[]> {
    return request<SearchCategory[]>('/search/categories')
  },

  async listCities(): Promise<SearchCity[]> {
    return request<SearchCity[]>('/search/cities')
  },

  /** "Causas perto de você": campanhas em andamento; cidade escolhida primeiro */
  async listCausas(params: { category?: string; city?: string; lat?: number; lng?: number } = {}): Promise<SearchCampaign[]> {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.city) qs.set('city', params.city)
    // posição do usuário só nesta consulta (o servidor não guarda)
    if (params.lat !== undefined && params.lng !== undefined) {
      qs.set('lat', params.lat.toFixed(2)) // ~1 km: basta para ordenar e protege a privacidade
      qs.set('lng', params.lng.toFixed(2))
    }
    return request<SearchCampaign[]>(`/search/causas?${qs}`)
  },
}
