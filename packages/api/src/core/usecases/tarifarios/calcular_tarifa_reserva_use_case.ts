import type { CalculoTarifaReserva } from '@hotelmind/contracts'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'

export interface CalcularTarifaReservaInput {
  hotel_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
}

export class CalcularTarifaReservaUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService(),
  ) {}

  async execute(
    input: CalcularTarifaReservaInput,
  ): Promise<CalculoTarifaReserva> {
    const categoria = await this.categorias.find_by_id(
      input.categoria_quarto_id,
      input.hotel_id,
    )
    if (!categoria?.is_ativa) {
      throw new CategoriaQuartoInativaError()
    }

    const tarifarios_ativos = await this.tarifarios.find_active_for_range({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      data_inicio: input.check_in,
      data_fim: input.check_out,
    })

    return this.pricing_service.calcular_reserva({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      check_in: input.check_in,
      check_out: input.check_out,
      tarifarios: tarifarios_ativos,
    })
  }
}
