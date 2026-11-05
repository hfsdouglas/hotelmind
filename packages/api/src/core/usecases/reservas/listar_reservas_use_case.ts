import type { ReservaListParams } from '@hotelmind/contracts'
import type { Reserva } from '@/core/entities/reserva'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'

export interface ListarReservasInput extends ReservaListParams {
  hotel_id: string
}

export class ListarReservasUseCase {
  constructor(private readonly reservas_repo: IReservaRepository) {}

  async execute(input: ListarReservasInput): Promise<PaginatedResult<Reserva>> {
    const { hotel_id, ...params } = input
    return this.reservas_repo.list(hotel_id, params)
  }
}
