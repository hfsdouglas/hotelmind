import type {
  CreateOrcamentoPayload,
  Orcamento,
  OrcamentoListParams,
  OrcamentoListResponse,
  OrcamentoPublicoVisualizacao,
  UpdateOrcamentoPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const orcamentosService = {
  list: (params?: OrcamentoListParams) =>
    api.get<OrcamentoListResponse>('/orcamentos', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Orcamento>(`/orcamentos/${id}`).then(r => r.data),

  getPublico: (token: string) =>
    api
      .get<OrcamentoPublicoVisualizacao>(`/orcamentos/publico/${token}`)
      .then(r => r.data),

  create: (data: CreateOrcamentoPayload) =>
    api.post<Orcamento>('/orcamentos', data).then(r => r.data),

  update: (id: string, data: UpdateOrcamentoPayload) =>
    api.put<Orcamento>(`/orcamentos/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/orcamentos/${id}`).then(r => r.data),
}
