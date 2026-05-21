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
    return request<{ institutionId: string }>('/institutions/register/step', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async uploadFile(file: File): Promise<string> {
    const token = localStorage.getItem('accessToken')
    const form = new FormData()
    form.append('file', file)
    const base = (import.meta.env.VITE_API_URL as string) ?? ''
    const res = await fetch(`${base}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    const data = await res.json() as { url?: string; error?: string }
    if (!res.ok) throw new Error(data.error ?? 'Erro no upload')
    return data.url!
  },
}
