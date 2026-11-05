import { randomBytes } from 'node:crypto'
import type { FnrhLinkInfo } from '@hotelmind/contracts'
import {
  ReservaNotFoundError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'
import { ReservaStatusService } from '@/core/services/reserva_status_service'

export class GerenciarLinkFnrhUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly status_service: ReservaStatusService = new ReservaStatusService()
  ) {}

  async regenerar(reserva_id: string, hotel_id: string): Promise<FnrhLinkInfo> {
    const reserva = await this.reservas_repo.find_by_id(reserva_id, hotel_id)
    if (!reserva) {
      throw new ReservaNotFoundError()
    }

    if (!this.status_service.permite_link_publico(reserva.status)) {
      throw new ReservaValidationError(
        `Não é possível regenerar o link de uma reserva com status '${reserva.status}'.`
      )
    }

    const novo_token = randomBytes(24).toString('base64url')
    const updated = await this.reservas_repo.update(reserva_id, hotel_id, {
      token_fnrh: novo_token,
      token_fnrh_ativo: true,
    })

    if (!updated) {
      throw new ReservaNotFoundError()
    }

    return {
      url_token: novo_token,
      ativo: true,
    }
  }

  async desativar(reserva_id: string, hotel_id: string): Promise<FnrhLinkInfo> {
    const reserva = await this.reservas_repo.find_by_id(reserva_id, hotel_id)
    if (!reserva) {
      throw new ReservaNotFoundError()
    }

    const updated = await this.reservas_repo.update(reserva_id, hotel_id, {
      token_fnrh_ativo: false,
    })

    if (!updated) {
      throw new ReservaNotFoundError()
    }

    return {
      url_token: updated.token_fnrh,
      ativo: false,
    }
  }
}
