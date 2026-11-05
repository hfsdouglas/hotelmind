import type {
  NoiteCalculadaOrcamento,
  OrcamentoStatus,
} from '@hotelmind/contracts'
import type { Orcamento } from '@/core/entities/orcamento'
import { CategoriaQuartoNotFoundError } from '@/core/errors/categoria_quarto_errors'
import {
  OrcamentoNotFoundError,
  OrcamentoValidationError,
} from '@/core/errors/orcamento_errors'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { ILeadRepository } from '@/core/repositories/leads/lead_repository'
import type { IOrcamentoRepository } from '@/core/repositories/orcamentos/orcamento_repository'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'

export interface EditarOrcamentoInput {
  id: string
  hotel_id: string
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  check_in?: string
  check_out?: string
  quantidade_adultos?: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string | null
  cupom_desconto?: string | null
  status?: OrcamentoStatus
  lead?: {
    nome?: string
    telefone?: string
    email?: string
  }
}

export class EditarOrcamentoUseCase {
  constructor(
    private readonly orcamentos: IOrcamentoRepository,
    private readonly regimes_alimentacao: IRegimeAlimentacaoRepository,
    private readonly categorias: ICategoriaQuartoRepository,
    private readonly tarifarios: ITarifarioRepository,
    private readonly leads?: ILeadRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService()
  ) {}

  async execute(input: EditarOrcamentoInput): Promise<Orcamento> {
    const existing = await this.orcamentos.find_by_id(input.id, input.hotel_id)
    if (!existing) {
      throw new OrcamentoNotFoundError()
    }

    const regime_id =
      input.regime_alimentacao_id ?? existing.regime_alimentacao_id
    const categoria_id =
      input.categoria_quarto_id ?? existing.categoria_quarto_id
    const check_in = input.check_in ?? existing.check_in
    const check_out = input.check_out ?? existing.check_out

    let valor_total = existing.valor_total
    let detalhamento_noites = existing.detalhamento_noites

    // Recalcular diárias se datas, categoria ou regime mudaram
    const needs_recalc =
      input.regime_alimentacao_id !== undefined ||
      input.categoria_quarto_id !== undefined ||
      input.check_in !== undefined ||
      input.check_out !== undefined

    if (needs_recalc) {
      const regime = await this.regimes_alimentacao.find_by_id(
        regime_id,
        input.hotel_id
      )
      if (!regime) throw new RegimeAlimentacaoNotFoundError()
      if (!regime.ativo)
        throw new OrcamentoValidationError(
          'O regime de alimentação selecionado está inativo.'
        )

      const categoria = await this.categorias.find_by_id(
        categoria_id,
        input.hotel_id
      )
      if (!categoria) throw new CategoriaQuartoNotFoundError()
      if (!categoria.is_ativa) throw new CategoriaQuartoInativaError()

      const tarifarios_ativos = await this.tarifarios.find_active_for_range({
        hotel_id: input.hotel_id,
        categoria_quarto_id: categoria_id,
        data_inicio: check_in,
        data_fim: check_out,
      })

      const tarifarios_do_regime = tarifarios_ativos.filter(
        t => t.regime_alimentacao_id === regime_id
      )

      const calculo = this.pricing_service.calcular_reserva({
        hotel_id: input.hotel_id,
        categoria_quarto_id: categoria_id,
        check_in,
        check_out,
        tarifarios: tarifarios_do_regime,
      })

      valor_total = calculo.valor_total
      detalhamento_noites = calculo.noites as NoiteCalculadaOrcamento[]
    }

    if (input.lead && this.leads && existing.lead_id) {
      await this.leads.update({
        id: existing.lead_id,
        hotel_id: input.hotel_id,
        nome: input.lead.nome,
        telefone: input.lead.telefone,
        email: input.lead.email,
      })
    }

    return this.orcamentos.update({
      id: input.id,
      hotel_id: input.hotel_id,
      regime_alimentacao_id: input.regime_alimentacao_id,
      categoria_quarto_id: input.categoria_quarto_id,
      check_in: input.check_in,
      check_out: input.check_out,
      quantidade_adultos: input.quantidade_adultos,
      quantidade_criancas: input.quantidade_criancas,
      quantidade_pets: input.quantidade_pets,
      valor_total,
      detalhamento_noites,
      status: input.status,
      observacoes: input.observacoes,
      cupom_desconto: input.cupom_desconto,
    })
  }
}
