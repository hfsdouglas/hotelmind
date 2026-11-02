export interface CategoriaQuarto {
  id: string
  hotel_id: string
  nome: string
  status: 'S' | 'N'
  created_at: string
  updated_at: string
}

export interface CategoriaQuartoListResponse {
  data: CategoriaQuarto[]
  meta: PaginacaoMeta
}

export interface CreateCategoriaQuartoPayload {
  nome: string
  status?: 'S' | 'N'
}

export interface UpdateCategoriaQuartoPayload {
  nome: string
  status: 'S' | 'N'
}

import type { PaginacaoMeta } from './grupos.js'
