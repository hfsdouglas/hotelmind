import type {
  ConsultarDisponibilidadeParams,
  CreateReservaPayload,
  FnrhLinkInfo,
  FnrhPublicaView,
  QuartoDisponivel,
  Reserva,
  ReservaHospede,
  ReservaListParams,
  ReservaListResponse,
  ReservaStatus,
  SaveFichaPayload,
  UpdateReservaPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const reservasService = {
  list: (params?: ReservaListParams) =>
    api.get<ReservaListResponse>('/reservas', { params }).then(r => r.data),

  get: (id: string) => api.get<Reserva>(`/reservas/${id}`).then(r => r.data),

  create: (data: CreateReservaPayload) =>
    api.post<Reserva>('/reservas', data).then(r => r.data),

  update: (id: string, data: UpdateReservaPayload) =>
    api.put<Reserva>(`/reservas/${id}`, data).then(r => r.data),

  changeStatus: (id: string, status: ReservaStatus) =>
    api.patch<Reserva>(`/reservas/${id}/status`, { status }).then(r => r.data),

  disponibilidade: (params: ConsultarDisponibilidadeParams) =>
    api
      .get<QuartoDisponivel[]>('/reservas/disponibilidade', { params })
      .then(r => r.data),

  salvarFichaHospede: (
    reservaId: string,
    posicao: number,
    data: SaveFichaPayload
  ) =>
    api
      .put<ReservaHospede>(`/reservas/${reservaId}/hospedes/${posicao}`, data)
      .then(r => r.data),

  regenerarLinkFnrh: (reservaId: string) =>
    api
      .post<FnrhLinkInfo>(`/reservas/${reservaId}/link-fnrh/regenerar`)
      .then(r => r.data),

  desativarLinkFnrh: (reservaId: string) =>
    api
      .post<FnrhLinkInfo>(`/reservas/${reservaId}/link-fnrh/desativar`)
      .then(r => r.data),

  // Métodos da tela pública FNRH
  getFnrhPublica: (token: string) =>
    api.get<FnrhPublicaView>(`/reservas/publico/${token}`).then(r => r.data),

  salvarFichaPublica: (
    token: string,
    posicao: number,
    data: SaveFichaPayload
  ) =>
    api
      .put<ReservaHospede>(
        `/reservas/publico/${token}/hospedes/${posicao}`,
        data
      )
      .then(r => r.data),

  enviarFnrhAoHotel: (token: string) =>
    api
      .post<{ fnrh_enviada_em: string }>(`/reservas/publico/${token}/enviar`)
      .then(r => r.data),
}
