import { api } from '@/lib/axios'
import type { LoginFormData } from '@/schemas/auth.schema'
import type { LoginResponse } from '@/types/auth'

export const authService = {
  login: (data: LoginFormData) =>
    api.post<LoginResponse>('/auth/login', data).then(res => res.data),
  me: () => api.get<{ ok: boolean }>('/auth/me').then(res => res.data),
}
