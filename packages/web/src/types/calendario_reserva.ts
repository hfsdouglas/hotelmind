import type {
  ConfiguracaoCama,
  FichaStatus,
  ReservaStatus,
} from '@hotelmind/contracts'

export type CalendarioStatusReserva = Extract<
  ReservaStatus,
  'a_confirmar' | 'confirmada' | 'check_in'
>

export const STATUS_EXIBIDOS_NO_CALENDARIO: readonly CalendarioStatusReserva[] =
  ['a_confirmar', 'confirmada', 'check_in']

export const STATUS_RESERVA_LABEL: Record<ReservaStatus, string> = {
  a_confirmar: 'A Confirmar',
  confirmada: 'Confirmada',
  check_in: 'Check-in',
  check_out: 'Check-out',
  no_show: 'No-show',
  cancelada: 'Cancelada',
}

export interface CalendarioHospede {
  posicao: number
  nome: string | null
  ficha_status: FichaStatus
}

export interface Reservation {
  id: string
  codigo: string
  quartoId: string
  quarto_identificacao: string
  categoria_nome: string
  camas: ConfiguracaoCama[]
  checkIn: string
  checkOut: string
  diarias: number
  status: CalendarioStatusReserva
  status_label: string
  titular: {
    nome: string
    email: string | null
    telefone: string | null
  }
  adultos: number
  criancas: number
  regime_titulo: string | null
  parceiro_nome: string | null
  valor_total: number
  observacoes: string | null
  hospedes: CalendarioHospede[]
  fichas_preenchidas: number
  total_hospedes: number
}

export type RoomStatus =
  | 'disponivel'
  | 'bloqueado'
  | 'manutencao'
  | 'limpeza'
  | 'checkin'

export interface Room {
  id: string
  numero: string
  tipo: string
  camas: ConfiguracaoCama[]
  status: RoomStatus
}

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  disponivel: 'Disponível',
  bloqueado: 'Bloqueado',
  manutencao: 'Manutenção',
  limpeza: 'Limpeza',
  checkin: 'Check-in',
}

export type OpcaoCheckIn = 'confirmar' | 'preencher_fnrh' | 'sem_preencher'

export type AvaliacaoCheckIn =
  | { permitido: true }
  | { permitido: false; motivo: string }
