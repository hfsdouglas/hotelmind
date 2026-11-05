import type { ReservaStatus } from '@hotelmind/contracts'
import { ReservaTransicaoInvalidaError } from '@/core/errors/reserva_errors'

const TRANSICOES_VALIDAS: Record<ReservaStatus, ReservaStatus[]> = {
  a_confirmar: ['confirmada', 'cancelada'],
  confirmada: ['check_in', 'no_show', 'cancelada'],
  check_in: ['check_out'],
  check_out: [],
  no_show: [],
  cancelada: [],
}

export class ReservaStatusService {
  validar_transicao(atual: ReservaStatus, novo: ReservaStatus): void {
    if (atual === novo) return

    const permitidos = TRANSICOES_VALIDAS[atual] || []
    if (!permitidos.includes(novo)) {
      throw new ReservaTransicaoInvalidaError(atual, novo)
    }
  }

  is_final(status: ReservaStatus): boolean {
    return (
      status === 'check_out' || status === 'no_show' || status === 'cancelada'
    )
  }

  permite_link_publico(status: ReservaStatus): boolean {
    return (
      status === 'a_confirmar' ||
      status === 'confirmada' ||
      status === 'check_in'
    )
  }

  bloqueia_disponibilidade(status: ReservaStatus): boolean {
    return (
      status === 'a_confirmar' ||
      status === 'confirmada' ||
      status === 'check_in' ||
      status === 'check_out'
    )
  }
}
