import {
  FnrhLinkInvalidoError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type {
  IReservaHospedeRepository,
  IReservaRepository,
} from '@/core/repositories/reservas/reserva_repository'
import { ReservaStatusService } from '@/core/services/reserva_status_service'

export class EnviarFnrhUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hospedes_repo: IReservaHospedeRepository,
    private readonly status_service: ReservaStatusService = new ReservaStatusService()
  ) {}

  async execute(token: string): Promise<{ fnrh_enviada_em: string }> {
    const reserva = await this.reservas_repo.find_by_token_fnrh(token)
    if (!reserva?.token_fnrh_ativo) {
      throw new FnrhLinkInvalidoError()
    }

    if (!this.status_service.permite_link_publico(reserva.status)) {
      throw new FnrhLinkInvalidoError()
    }

    const hoje = new Date().toISOString().slice(0, 10)
    if (hoje > reserva.check_out) {
      throw new FnrhLinkInvalidoError()
    }

    const hospedes = await this.hospedes_repo.find_by_reserva_id(reserva.id)
    const pendentes = hospedes.filter(h => h.ficha_status !== 'preenchida')

    if (pendentes.length > 0) {
      const posicoes = pendentes.map(h => h.posicao).join(', ')
      throw new ReservaValidationError(
        `Existem fichas de hóspedes pendentes de preenchimento completo: posições (${posicoes}).`
      )
    }

    const agora = new Date()
    await this.reservas_repo.update(reserva.id, reserva.hotel_id, {
      fnrh_enviada_em: agora,
    })

    return {
      fnrh_enviada_em: agora.toISOString(),
    }
  }
}
