import type {
  CategoriaQuarto,
  CategoriaQuartoListResponse,
  CreateCategoriaQuartoPayload,
  UpdateCategoriaQuartoPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export interface CategoriaQuartoListParams {
  pagina?: number
  limite?: number
  busca?: string
  status?: 'S' | 'N'
}

export const categoriasQuartosService = {
  list: (params?: CategoriaQuartoListParams) =>
    api
      .get<CategoriaQuartoListResponse>('/categorias_quartos', { params })
      .then(r => r.data),
  get: (id: string) =>
    api.get<CategoriaQuarto>(`/categorias_quartos/${id}`).then(r => r.data),
  create: (data: CreateCategoriaQuartoPayload) =>
    api.post<CategoriaQuarto>('/categorias_quartos', data).then(r => r.data),
  update: (id: string, data: UpdateCategoriaQuartoPayload) =>
    api
      .put<CategoriaQuarto>(`/categorias_quartos/${id}`, data)
      .then(r => r.data),
}
