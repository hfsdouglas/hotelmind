import { randomUUID } from 'node:crypto'
import type {
  NoiteCalculadaOrcamento,
  OrcamentoStatus,
} from '@hotelmind/contracts'
import type { Orcamento } from '@/core/entities/orcamento'
import { CategoriaQuartoNotFoundError } from '@/core/errors/categoria_quarto_errors'
import { LeadNotFoundError } from '@/core/errors/lead_errors'
import { OrcamentoValidationError } from '@/core/errors/orcamento_errors'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { ILeadRepository } from '@/core/repositories/leads/lead_repository'
import type { IOrcamentoRepository } from '@/core/repositories/orcamentos/orcamento_repository'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'
import { CriarLeadUseCase } from '@/core/usecases/leads/criar_lead_use_case'

export interface CriarOrcamentoInput {
  hotel_id: string
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string | null
  cupom_desconto?: string | null
  lead_id?: string
  lead?: {
    nome: string
    telefone: string
    email: string
  }
}

export class CriarOrcamentoUseCase {
  constructor(
    private readonly orcamentos: IOrcamentoRepository,
    private readonly leads: ILeadRepository,
    private readonly regimes_alimentacao: IRegimeAlimentacaoRepository,
    private readonly categorias: ICategoriaQuartoRepository,
    private readonly tarifarios: ITarifarioRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService(),
    private readonly criar_lead_use_case: CriarLeadUseCase = new CriarLeadUseCase(
      leads
    )
  ) {}

  async execute(input: CriarOrcamentoInput): Promise<Orcamento> {
    // 1. Validar ou criar lead
    let lead_id = input.lead_id
    if (input.lead) {
      const lead = await this.criar_lead_use_case.execute({
        hotel_id: input.hotel_id,
        nome: input.lead.nome,
        telefone: input.lead.telefone,
        email: input.lead.email,
      })
      lead_id = lead.id
    } else if (lead_id) {
      const existing = await this.leads.find_by_id(lead_id, input.hotel_id)
      if (!existing) {
        throw new LeadNotFoundError()
      }
    } else {
      throw new OrcamentoValidationError(
        'Informe os dados do lead para o orçamento.'
      )
    }

    // 2. Validar regime de alimentação
    const regime = await this.regimes_alimentacao.find_by_id(
      input.regime_alimentacao_id,
      input.hotel_id
    )
    if (!regime) {
      throw new RegimeAlimentacaoNotFoundError()
    }
    if (!regime.ativo) {
      throw new OrcamentoValidationError(
        'O regime de alimentação selecionado está inativo.'
      )
    }

    // 3. Validar categoria de acomodação
    const categoria = await this.categorias.find_by_id(
      input.categoria_quarto_id,
      input.hotel_id
    )
    if (!categoria) {
      throw new CategoriaQuartoNotFoundError()
    }
    if (!categoria.is_ativa) {
      throw new CategoriaQuartoInativaError()
    }

    // 4. Calcular tarifas sem checar disponibilidade de quartos físicos
    const tarifarios_ativos = await this.tarifarios.find_active_for_range({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      data_inicio: input.check_in,
      data_fim: input.check_out,
    })

    const tarifarios_do_regime = tarifarios_ativos.filter(
      t => t.regime_alimentacao_id === input.regime_alimentacao_id
    )

    const calculo = this.pricing_service.calcular_reserva({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      check_in: input.check_in,
      check_out: input.check_out,
      tarifarios: tarifarios_do_regime,
    })

    const token_publico = randomUUID().replace(/-/g, '')

    return this.orcamentos.create({
      hotel_id: input.hotel_id,
      lead_id,
      regime_alimentacao_id: input.regime_alimentacao_id,
      categoria_quarto_id: input.categoria_quarto_id,
      check_in: input.check_in,
      check_out: input.check_out,
      quantidade_adultos: input.quantidade_adultos,
      quantidade_criancas: input.quantidade_criancas ?? 0,
      quantidade_pets: input.quantidade_pets ?? 0,
      valor_total: calculo.valor_total,
      detalhamento_noites: calculo.noites as NoiteCalculadaOrcamento[],
      token_publico,
      status: 'pendente' as OrcamentoStatus,
      observacoes: input.observacoes,
      cupom_desconto: input.cupom_desconto,
    })
  }
}
