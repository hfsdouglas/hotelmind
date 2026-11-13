import type { Quarto, Reserva } from '@hotelmind/contracts'
import { differenceInCalendarDays } from 'date-fns'
import {
  type CalendarioStatusReserva,
  type Reservation,
  type Room,
  type RoomStatus,
  STATUS_EXIBIDOS_NO_CALENDARIO,
  STATUS_RESERVA_LABEL,
} from '@/types/calendario_reserva'

const FALLBACK_QUARTO = '-'
const FALLBACK_CATEGORIA = 'Padrão'

function to_local_midnight(value: string): string {
  return `${value.split('T')[0]}T00:00:00`
}

export function map_reserva_to_calendario(
  reserva: Reserva,
  quarto: Quarto | undefined
): Reservation {
  const check_in = to_local_midnight(reserva.check_in)
  const check_out = to_local_midnight(reserva.check_out)
  const valor = Number(reserva.valor_total)

  return {
    id: reserva.id,
    codigo: reserva.codigo,
    quartoId: reserva.quarto_id,
    quarto_identificacao:
      reserva.quarto?.identificacao ?? quarto?.identificacao ?? FALLBACK_QUARTO,
    categoria_nome:
      reserva.quarto?.categoria_nome ??
      quarto?.categoria?.nome ??
      FALLBACK_QUARTO,
    camas: quarto?.camas ?? [],
    checkIn: check_in,
    checkOut: check_out,
    diarias: differenceInCalendarDays(new Date(check_out), new Date(check_in)),
    status: reserva.status as CalendarioStatusReserva,
    status_label: STATUS_RESERVA_LABEL[reserva.status],
    titular: {
      nome: reserva.titular_nome,
      email: reserva.titular_email,
      telefone: reserva.titular_telefone,
    },
    adultos: reserva.quantidade_adultos,
    criancas: reserva.quantidade_criancas,
    regime_titulo: reserva.regime_alimentacao?.titulo ?? null,
    parceiro_nome: reserva.parceiro?.razao_social ?? null,
    valor_total: Number.isNaN(valor) ? 0 : valor,
    observacoes: reserva.observacoes || null,
    hospedes: [...(reserva.hospedes ?? [])]
      .sort((a, b) => a.posicao - b.posicao)
      .map(h => ({
        posicao: h.posicao,
        nome: h.nome_completo || null,
        ficha_status: h.ficha_status,
      })),
    fichas_preenchidas: reserva.fichas_preenchidas,
    total_hospedes: reserva.total_hospedes,
  }
}

export function filtrar_reservas_calendario(reservas: Reserva[]): Reserva[] {
  return reservas.filter(r =>
    (STATUS_EXIBIDOS_NO_CALENDARIO as readonly string[]).includes(r.status)
  )
}

export function derive_suite_status(
  quarto: Quarto,
  reservations: Reservation[]
): RoomStatus {
  if (quarto.status === 'N') return 'bloqueado'
  const em_check_in = reservations.some(
    r => r.quartoId === quarto.id && r.status === 'check_in'
  )
  return em_check_in ? 'checkin' : 'disponivel'
}

export function map_quarto_to_room(
  quarto: Quarto,
  reservations: Reservation[]
): Room {
  return {
    id: quarto.id,
    numero: quarto.identificacao,
    tipo: quarto.categoria?.nome || FALLBACK_CATEGORIA,
    camas: quarto.camas ?? [],
    status: derive_suite_status(quarto, reservations),
  }
}
