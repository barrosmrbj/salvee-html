import { request } from './api'
import type { Institution, InstitutionRegisterPayload, MyInstitution, MyInstitutionForEdit } from '@/types'

export const institutionService = {
  /** instituições pelas quais o usuário é responsável (qualquer status) */
  async listMine(): Promise<MyInstitution[]> {
    return request<MyInstitution[]>('/institutions/mine')
  },

  /** dados completos para corrigir o cadastro (só o responsável) */
  async getMineForEdit(id: string): Promise<MyInstitutionForEdit> {
    return request<MyInstitutionForEdit>(`/institutions/mine/${id}`)
  },

  /** depois de corrigir: volta para análise (needs_revision → pending) */
  async resubmit(id: string): Promise<void> {
    await request<void>(`/institutions/${id}/resubmit`, { method: 'POST' })
  },

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
