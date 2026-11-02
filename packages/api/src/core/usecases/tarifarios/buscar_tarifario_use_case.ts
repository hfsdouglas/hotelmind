import type { Tarifario } from '@/core/entities/tarifario'
import { TarifarioNotFoundError } from '@/core/errors/tarifario_errors'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export class BuscarTarifarioUseCase {
  constructor(private readonly tarifarios: ITarifarioRepository) {}

  async execute(id: string, hotel_id: string): Promise<Tarifario> {
    const tarifario = await this.tarifarios.find_by_id(id, hotel_id)
    if (!tarifario) {
      throw new TarifarioNotFoundError()
    }
    return tarifario
  }
}
