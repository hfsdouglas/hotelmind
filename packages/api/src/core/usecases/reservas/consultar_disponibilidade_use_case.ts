import type { QuartoDisponivel } from '@hotelmind/contracts'
import type { IQuartoRepository } from '@/core/repositories/quartos/quarto.repository'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'

export interface ConsultarDisponibilidadeInput {
  hotel_id: string
  check_in: string
  check_out: string
  regime_alimentacao_id: string
  pessoas: number
  parceiro_id?: string | null
  ignorar_reserva_id?: string
}

export class ConsultarDisponibilidadeUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly quartos_repo: IQuartoRepository,
    private readonly tarifarios_repo: ITarifarioRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService()
  ) {}

  async execute(
    input: ConsultarDisponibilidadeInput
  ): Promise<QuartoDisponivel[]> {
    const { hotel_id, check_in, check_out, regime_alimentacao_id, pessoas } =
      input

    // 1. Listar quartos ativos do hotel
    const quartos_paginados = await this.quartos_repo.list(hotel_id, {
      pagina: 1,
      limite: 1000,
      status: 'S',
    })

    // 2. Filtrar quartos ativos com capacidade adequada
    const quartos_capacidade = quartos_paginados.data.filter(
      q => q.status === 'S' && q.limite_hospedes >= pessoas
    )

    if (quartos_capacidade.length === 0) return []

    // 3. Identificar quartos com reservas conflitantes
    const quartos_ids = quartos_capacidade.map(q => q.id)
    const ocupados = await this.reservas_repo.find_conflitos_por_quartos(
      quartos_ids,
      check_in,
      check_out,
      input.ignorar_reserva_id
    )

    const livres = quartos_capacidade.filter(q => !ocupados.includes(q.id))
    if (livres.length === 0) return []

    // 4. Calcular tarifas por categoria de quarto
    const categorias_calculo = new Map<string, string | null>()
    const categorias_ids = Array.from(new Set(livres.map(q => q.categoria_id)))

    for (const cat_id of categorias_ids) {
      try {
        const tarifarios_ativos =
          await this.tarifarios_repo.find_active_for_range({
            hotel_id,
            categoria_quarto_id: cat_id,
            parceiro_id: input.parceiro_id,
            data_inicio: check_in,
            data_fim: check_out,
          })

        const do_regime = tarifarios_ativos.filter(
          t => t.regime_alimentacao_id === regime_alimentacao_id
        )

        const calculo = this.pricing_service.calcular_reserva({
          hotel_id,
          categoria_quarto_id: cat_id,
          parceiro_id: input.parceiro_id,
          check_in,
          check_out,
          tarifarios: do_regime,
        })

        categorias_calculo.set(cat_id, calculo.valor_total)
      } catch {
        // Sem cobertura de tarifa para o período ou regime
        categorias_calculo.set(cat_id, null)
      }
    }

    // 5. Retornar quartos disponíveis que possuem cálculo de tarifa
    const resultado: QuartoDisponivel[] = []

    for (const quarto of livres) {
      const valor_total = categorias_calculo.get(quarto.categoria_id)
      if (valor_total !== null && valor_total !== undefined) {
        resultado.push({
          quarto_id: quarto.id,
          identificacao: quarto.identificacao,
          categoria_id: quarto.categoria_id,
          categoria_nome: quarto.categoria?.nome ?? '',
          limite_hospedes: quarto.limite_hospedes,
          valor_total,
        })
      }
    }

    return resultado.sort((a, b) =>
      a.identificacao.localeCompare(b.identificacao, undefined, {
        numeric: true,
      })
    )
  }
}
