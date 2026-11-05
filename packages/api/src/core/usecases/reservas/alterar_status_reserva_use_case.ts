import type { ReservaStatus } from '@hotelmind/contracts'
import type { Reserva } from '@/core/entities/reserva'
import { ReservaNotFoundError } from '@/core/errors/reserva_errors'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'
import { ReservaStatusService } from '@/core/services/reserva_status_service'

export interface AlterarStatusReservaInput {
  reserva_id: string
  hotel_id: string
  status_novo: ReservaStatus
  user_id?: string | null
}

export class AlterarStatusReservaUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly status_service: ReservaStatusService = new ReservaStatusService()
  ) {}

  async execute(input: AlterarStatusReservaInput): Promise<Reserva> {
    const { reserva_id, hotel_id, status_novo, user_id } = input

    const reserva = await this.reservas_repo.find_by_id(reserva_id, hotel_id)
    if (!reserva) {
      throw new ReservaNotFoundError()
    }

    this.status_service.validar_transicao(reserva.status, status_novo)

    const updated = await this.reservas_repo.update(reserva_id, hotel_id, {
      status: status_novo,
    })

    if (!updated) {
      throw new ReservaNotFoundError()
    }

    await this.reservas_repo.create_status_historico(
      reserva_id,
      reserva.status,
      status_novo,
      user_id
    )

    return updated
  }
}
