import type {
  CreateQuartoPayload,
  Quarto,
  QuartoListParams,
  QuartoListResponse,
  UpdateQuartoPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const quartosService = {
  list: (params?: QuartoListParams) =>
    api.get<QuartoListResponse>('/quartos', { params }).then(r => r.data),
  get: (id: string) => api.get<Quarto>(`/quartos/${id}`).then(r => r.data),
  create: (data: CreateQuartoPayload) =>
    api.post<Quarto>('/quartos', data).then(r => r.data),
  update: (id: string, data: UpdateQuartoPayload) =>
    api.put<Quarto>(`/quartos/${id}`, data).then(r => r.data),
}
