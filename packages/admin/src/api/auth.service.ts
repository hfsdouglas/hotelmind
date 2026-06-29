import { api } from '@/lib/axios'
import type { LoginResponse, AdminSession } from '@/types/auth'

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  login: (data: LoginData) =>
    api.post<LoginResponse>('/admin/auth/login', data).then(res => res.data),
  me: () =>
    api.get<AdminSession>('/admin/auth/me').then(res => res.data),
  logout: () =>
    api.post<{ message: string }>('/admin/auth/logout').then(res => res.data),
}
