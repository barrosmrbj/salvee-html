export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  xp: number
  salves: number
  level: number
  role?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}
