import { request } from './api'
import type { AdminDonation, AdminInstitution, AdminPromotion, AdminUser, DonationStatus, InstitutionStatus, PromotionPayload } from '@/types'

export const adminService = {
  async listInstitutions(status?: InstitutionStatus): Promise<AdminInstitution[]> {
    const query = status ? `?status=${status}` : ''
    return request<AdminInstitution[]>(`/admin/institutions${query}`)
  },

  async updateInstitutionStatus(id: string, status: InstitutionStatus, reason?: string): Promise<void> {
    await request<void>(`/admin/institutions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(reason ? { status, reason } : { status }),
    })
  },

  async listUsers(params: { name?: string; role?: 'user' | 'gestor' | 'admin' } = {}): Promise<AdminUser[]> {
    const query = new URLSearchParams()
    if (params.name) query.set('name', params.name)
    if (params.role) query.set('role', params.role)
    const qs = query.toString()
    return request<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`)
  },

  async updateUserRole(id: string, role: 'user' | 'gestor'): Promise<void> {
    await request<void>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  async listPromotions(): Promise<AdminPromotion[]> {
    return request<AdminPromotion[]>('/admin/promotions')
  },

  async createPromotion(payload: PromotionPayload): Promise<AdminPromotion> {
    return request<AdminPromotion>('/admin/promotions', { method: 'POST', body: JSON.stringify(payload) })
  },

  async updatePromotion(id: string, payload: PromotionPayload): Promise<AdminPromotion> {
    return request<AdminPromotion>(`/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async deletePromotion(id: string): Promise<void> {
    await request<void>(`/admin/promotions/${id}`, { method: 'DELETE' })
  },

  async listDonations(status?: DonationStatus): Promise<AdminDonation[]> {
    const query = status ? `?status=${status}` : ''
    return request<AdminDonation[]>(`/admin/donations${query}`)
  },

  async updateDonationStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<void> {
    await request<void>(`/admin/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}
