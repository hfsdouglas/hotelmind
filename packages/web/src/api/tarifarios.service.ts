import type {
  ConsultarCalendarioTarifariosParams,
  ConsultarCalendarioTarifariosResponse,
  CreateTarifarioPayload,
  Tarifario,
  TarifarioListParams,
  TarifarioListResponse,
  UpdateTarifarioPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const tarifariosService = {
  list: (params?: TarifarioListParams) =>
    api.get<TarifarioListResponse>('/tarifarios', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Tarifario>(`/tarifarios/${id}`).then(r => r.data),
  create: (data: CreateTarifarioPayload) =>
    api.post<Tarifario>('/tarifarios', data).then(r => r.data),
  update: (id: string, data: UpdateTarifarioPayload) =>
    api.patch<Tarifario>(`/tarifarios/${id}`, data).then(r => r.data),
  activate: (id: string) =>
    api.patch<Tarifario>(`/tarifarios/${id}/ativar`).then(r => r.data),
  deactivate: (id: string) =>
    api.patch<Tarifario>(`/tarifarios/${id}/desativar`).then(r => r.data),
  calendar: (params: ConsultarCalendarioTarifariosParams) =>
    api
      .get<ConsultarCalendarioTarifariosResponse>('/tarifarios/calendario', {
        params,
      })
      .then(r => r.data),
}
