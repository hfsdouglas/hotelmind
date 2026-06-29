export interface Grupo {
  id: string
  hotel_id: string
  grupo: string
  descricao: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface PaginacaoMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginacaoMeta
}
