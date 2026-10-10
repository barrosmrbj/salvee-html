import { request } from './api'
import type { User } from '@/types'

export const userService = {
  async getProfile(): Promise<User> {
    return request<User>('/users/me')
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'phone' | 'accountType'>>): Promise<User> {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData()
    form.append('avatar', file)
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    return res.json() as Promise<{ avatarUrl: string }>
  },
}
