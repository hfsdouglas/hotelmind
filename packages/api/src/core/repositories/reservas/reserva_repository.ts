import type {
  DiariaReserva,
  FichaFnrh,
  FichaPreenchidaPor,
  FichaStatus,
  ReservaListParams,
  ReservaStatus,
} from '@hotelmind/contracts'
import type { Reserva } from '@/core/entities/reserva'
import type { ReservaHospede } from '@/core/entities/reserva_hospede'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface CreateReservaData {
  hotel_id: string
  codigo: string
  titular_nome: string
  titular_telefone?: string | null
  titular_email?: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_id?: string | null
  parceiro_comercial_id?: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  valor_total: string
  detalhamento_diarias: DiariaReserva[]
  status?: ReservaStatus
  token_fnrh: string
  token_fnrh_ativo?: boolean
  observacoes?: string | null
}

export interface UpdateReservaData {
  titular_nome?: string
  titular_telefone?: string | null
  titular_email?: string | null
  quarto_id?: string
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  parceiro_comercial_id?: string | null
  check_in?: string
  check_out?: string
  quantidade_adultos?: number
  quantidade_criancas?: number
  valor_total?: string
  detalhamento_diarias?: DiariaReserva[]
  status?: ReservaStatus
  token_fnrh?: string
  token_fnrh_ativo?: boolean
  fnrh_enviada_em?: Date | string | null
  observacoes?: string | null
}

export interface IReservaRepository {
  create(data: CreateReservaData): Promise<Reserva>
  update(
    id: string,
    hotel_id: string,
    data: UpdateReservaData
  ): Promise<Reserva | null>
  find_by_id(id: string, hotel_id: string): Promise<Reserva | null>
  find_by_token_fnrh(token: string): Promise<Reserva | null>
  find_conflito(
    quarto_id: string,
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<boolean>
  find_conflitos_por_quartos(
    quartos_ids: string[],
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<string[]>
  list(
    hotel_id: string,
    params: ReservaListParams
  ): Promise<PaginatedResult<Reserva>>
  gerar_proximo_codigo(hotel_id: string): Promise<string>
  create_log(
    reserva_id: string,
    hotel_id: string,
    dados_reserva: Record<string, unknown>,
    user_id?: string | null
  ): Promise<void>
  create_status_historico(
    reserva_id: string,
    status_anterior: string | null,
    status_novo: string,
    user_id?: string | null
  ): Promise<void>
}

export interface CreateReservaHospedeData {
  reserva_id: string
  posicao: number
  ficha_status?: FichaStatus
  nome_completo?: string | null
}

export interface UpdateFichaHospedeData extends Partial<FichaFnrh> {
  ficha_status?: FichaStatus
  preenchido_por?: FichaPreenchidaPor | null
  preenchido_em?: Date | string | null
}

export interface IReservaHospedeRepository {
  create_many(hospedes: CreateReservaHospedeData[]): Promise<void>
  find_by_reserva_id(reserva_id: string): Promise<ReservaHospede[]>
  find_by_reserva_and_posicao(
    reserva_id: string,
    posicao: number
  ): Promise<ReservaHospede | null>
  update_ficha(
    reserva_id: string,
    posicao: number,
    data: UpdateFichaHospedeData
  ): Promise<ReservaHospede | null>
  adjust_positions(reserva_id: string, nova_quantidade: number): Promise<void>
}
