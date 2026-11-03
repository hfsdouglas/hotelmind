import type { Tarifario } from '@/core/entities/tarifario'
import { TarifarioNotFoundError } from '@/core/errors/tarifario_errors'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export class DesativarTarifarioUseCase {
  constructor(private readonly tarifarios: ITarifarioRepository) {}

  async execute(id: string, hotel_id: string): Promise<Tarifario> {
    const current = await this.tarifarios.find_by_id(id, hotel_id)
    if (!current) {
      throw new TarifarioNotFoundError()
    }
    if (!current.ativo) {
      return current
    }

    return this.tarifarios.update({
      id: current.id,
      hotel_id,
      categoria_quarto_id: current.categoria_quarto_id,
      nome: current.nome,
      datas: current.datas,
      valor_diaria: current.valor_diaria,
      ativo: false,
    })
  }
}
