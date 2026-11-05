import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type {
  FindCalendarioPeriodsInput,
  ITarifarioRepository,
} from '@/core/repositories/tarifarios/tarifario.repository'

export class ConsultarPeriodosTarifariosUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository
  ) {}

  async execute(
    input: FindCalendarioPeriodsInput
  ): Promise<{ data: PeriodoTarifarioCalendario[] }> {
    const categoria = await this.categorias.find_by_id(
      input.categoria_quarto_id,
      input.hotel_id
    )
    if (!categoria) {
      throw new CategoriaQuartoInativaError()
    }

    const data = await this.tarifarios.find_periods_by_category(input)
    return { data }
  }
}
