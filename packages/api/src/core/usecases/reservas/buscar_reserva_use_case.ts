import type { Reserva } from '@/core/entities/reserva'
import { ReservaNotFoundError } from '@/core/errors/reserva_errors'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'

export interface BuscarReservaInput {
  id: string
  hotel_id: string
}

export class BuscarReservaUseCase {
  constructor(private readonly reservas_repo: IReservaRepository) {}

  async execute(input: BuscarReservaInput): Promise<Reserva> {
    const reserva = await this.reservas_repo.find_by_id(
      input.id,
      input.hotel_id
    )
    if (!reserva) {
      throw new ReservaNotFoundError()
    }
    return reserva
  }
}
