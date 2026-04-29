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
