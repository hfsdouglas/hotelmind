export interface AdminUser {
  id: string
  nome_completo: string
  email: string
}

export interface AdminSession {
  admin: AdminUser
}

export interface LoginResponse {
  admin: AdminUser
  message: string
}
