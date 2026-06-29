export interface Usuario {
  id: string
  hotel_id: string
  nome_completo: string
  email: string
  nascimento: string
  genero: string
  celular: string
  cpf: string
  rg: string | null
  grupos_ids: string | null
  created_at: string
  updated_at: string
}
