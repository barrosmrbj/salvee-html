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
