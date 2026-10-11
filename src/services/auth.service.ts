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

  async resetPassword(token: string, password: string): Promise<void> {
    await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  },

  async verifyEmail(token: string): Promise<void> {
    await request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  async resendVerification(): Promise<{ ok: boolean; alreadyVerified?: boolean }> {
    return request('/auth/resend-verification', { method: 'POST' })
  },

  // false em produção enquanto o SMTP da Hostinger não estiver configurado
  async mailStatus(): Promise<{ enabled: boolean }> {
    return request('/auth/mail-status')
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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  /** exclusão definitiva da conta (Configurações → Segurança → Excluir conta) */
  async deleteAccount(password: string): Promise<void> {
    await request('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirm: 'EXCLUIR', password: password || undefined }),
    })
    this.logout()
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
