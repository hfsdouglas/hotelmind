import type {
  CreateParceiroComercialPayload,
  ParceiroComercial,
  ParceiroComercialListParams,
  ParceiroComercialListResponse,
  UpdateParceiroComercialPayload,
  UpdateStatusParceiroPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const parceirosComerciaisService = {
  list: (params?: ParceiroComercialListParams) =>
    api
      .get<ParceiroComercialListResponse>('/comercial/parceiros', { params })
      .then(r => r.data),

  get: (id: string) =>
    api.get<ParceiroComercial>(`/comercial/parceiros/${id}`).then(r => r.data),

  create: (data: CreateParceiroComercialPayload) =>
    api.post<ParceiroComercial>('/comercial/parceiros', data).then(r => r.data),

  update: (id: string, data: UpdateParceiroComercialPayload) =>
    api
      .put<ParceiroComercial>(`/comercial/parceiros/${id}`, data)
      .then(r => r.data),

  updateStatus: (id: string, data: UpdateStatusParceiroPayload) =>
    api
      .patch<ParceiroComercial>(`/comercial/parceiros/${id}/status`, data)
      .then(r => r.data),

  delete: (id: string) =>
    api.delete(`/comercial/parceiros/${id}`).then(r => r.data),
}
