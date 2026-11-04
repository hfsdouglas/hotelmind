import type {
  CreateRegimeAlimentacaoPayload,
  RegimeAlimentacao,
  RegimeAlimentacaoListParams,
  RegimeAlimentacaoListResponse,
  UpdateRegimeAlimentacaoPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const regimesAlimentacaoService = {
  list: (params?: RegimeAlimentacaoListParams) =>
    api
      .get<RegimeAlimentacaoListResponse>('/regimes_alimentacao', { params })
      .then(r => r.data),

  get: (id: string) =>
    api.get<RegimeAlimentacao>(`/regimes_alimentacao/${id}`).then(r => r.data),

  create: (data: CreateRegimeAlimentacaoPayload) =>
    api.post<RegimeAlimentacao>('/regimes_alimentacao', data).then(r => r.data),

  update: (id: string, data: UpdateRegimeAlimentacaoPayload) =>
    api
      .put<RegimeAlimentacao>(`/regimes_alimentacao/${id}`, data)
      .then(r => r.data),

  ativar: (id: string) =>
    api
      .patch<RegimeAlimentacao>(`/regimes_alimentacao/${id}/ativar`)
      .then(r => r.data),

  desativar: (id: string) =>
    api
      .patch<RegimeAlimentacao>(`/regimes_alimentacao/${id}/desativar`)
      .then(r => r.data),
}
