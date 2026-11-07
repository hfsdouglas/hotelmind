import type { Tarifario } from '@/core/entities/tarifario'
import {
  normalize_datas,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioPeriodConflictError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export interface CriarTarifarioInput {
  hotel_id: string
  categoria_quarto_id: string
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  ativo?: boolean
}

export class CriarTarifarioUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository,
    private readonly parceiros?: IParceiroComercialRepository
  ) {}

  async execute(input: CriarTarifarioInput): Promise<Tarifario> {
    const trimmed_nome = input.nome.trim()
    if (!trimmed_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (trimmed_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.'
      )
    }
    const trimmed_regime_id = input.regime_alimentacao_id?.trim()
    if (!trimmed_regime_id) {
      throw new TarifarioValidationError(
        'O regime de alimentação é obrigatório.'
      )
    }

    const final_parceiro_id = input.parceiro_id || null
    if (final_parceiro_id && this.parceiros) {
      const parceiro = await this.parceiros.find_by_id(
        final_parceiro_id,
        input.hotel_id
      )
      if (!parceiro) {
        throw new TarifarioValidationError('Parceiro comercial não encontrado.')
      }
      if (parceiro.status !== 'ativo') {
        throw new TarifarioValidationError(
          'O parceiro comercial selecionado está inativo.'
        )
      }
    }

    const datas = normalize_datas(input.datas)
    const valor_diaria = normalize_valor_diaria(input.valor_diaria)
    const ativo = input.ativo ?? true

    const categoria = await this.categorias.find_by_id(
      input.categoria_quarto_id,
      input.hotel_id
    )
    if (!categoria?.is_ativa) {
      throw new CategoriaQuartoInativaError()
    }

    if (ativo) {
      const conflict = await this.tarifarios.find_overlapping_active({
        hotel_id: input.hotel_id,
        categoria_quarto_id: input.categoria_quarto_id,
        regime_alimentacao_id: trimmed_regime_id,
        parceiro_id: final_parceiro_id,
        datas,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    return this.tarifarios.create({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      regime_alimentacao_id: trimmed_regime_id,
      parceiro_id: final_parceiro_id,
      nome: trimmed_nome,
      datas,
      valor_diaria,
      ativo,
    })
  }
}
