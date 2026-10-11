import { request } from './api'
import type { AdminDonation, AdminInstitution, AdminPromotion, AdminReward, AdminUser, DonationStatus, GamificationSettings, InstitutionStatus, PromotionPayload, RewardPayload, ValidatedReward } from '@/types'
import { ApiError } from './api'

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

  async getGamificationSettings(): Promise<GamificationSettings> {
    return request<GamificationSettings>('/admin/settings/gamification')
  },

  async saveGamificationSettings(settings: GamificationSettings): Promise<GamificationSettings> {
    return request<GamificationSettings>('/admin/settings/gamification', { method: 'PUT', body: JSON.stringify(settings) })
  },

  async listRewards(): Promise<AdminReward[]> {
    return request<AdminReward[]>('/admin/rewards')
  },

  async createReward(payload: RewardPayload): Promise<AdminReward> {
    return request<AdminReward>('/admin/rewards', { method: 'POST', body: JSON.stringify(payload) })
  },

  async updateReward(id: string, payload: RewardPayload): Promise<AdminReward> {
    return request<AdminReward>(`/admin/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async deleteReward(id: string): Promise<void> {
    await request<void>(`/admin/rewards/${id}`, { method: 'DELETE' })
  },

  /** confirm=false só consulta; confirm=true marca como usada. Erros (já usada, vencida) trazem a recompensa */
  async validateReward(code: string, confirm: boolean): Promise<{ ok: boolean; reward?: ValidatedReward; error?: string }> {
    try {
      return await request<{ ok: boolean; reward: ValidatedReward }>('/admin/rewards/validate', { method: 'POST', body: JSON.stringify({ code, confirm }) })
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'Erro ao validar' }
    }
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
