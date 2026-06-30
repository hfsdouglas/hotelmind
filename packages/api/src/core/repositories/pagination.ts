export interface PaginationInput {
  pagina: number
  limite: number
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export interface PaginationMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
