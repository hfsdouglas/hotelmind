import type {
  ITarifarioRepository,
  TarifarioListFilter,
} from '@/core/repositories/tarifarios/tarifario.repository'

export class ListarTarifariosUseCase {
  constructor(private readonly tarifarios: ITarifarioRepository) {}

  async execute(hotel_id: string, input: TarifarioListFilter) {
    return this.tarifarios.list(hotel_id, input)
  }
}
