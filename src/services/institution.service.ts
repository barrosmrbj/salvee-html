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
