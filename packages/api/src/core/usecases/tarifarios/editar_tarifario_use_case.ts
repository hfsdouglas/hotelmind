import type { Tarifario } from '@/core/entities/tarifario'
import {
  normalize_datas,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioNotFoundError,
  TarifarioPeriodConflictError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export interface EditarTarifarioInput {
  id: string
  hotel_id: string
  categoria_quarto_id?: string
  categoria_quarto_ids?: string[]
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  nome?: string
  datas?: string[]
  valor_diaria?: string
  minimo_diarias?: number
  ativo?: boolean
}

export class EditarTarifarioUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository,
    private readonly parceiros?: IParceiroComercialRepository
  ) {}

  async execute(input: EditarTarifarioInput): Promise<Tarifario> {
    const current = await this.tarifarios.find_by_id(input.id, input.hotel_id)
    if (!current) {
      throw new TarifarioNotFoundError()
    }

    const next_categoria_ids =
      input.categoria_quarto_ids !== undefined
        ? Array.from(new Set(input.categoria_quarto_ids.filter(Boolean)))
        : input.categoria_quarto_id !== undefined
          ? [input.categoria_quarto_id]
          : current.categoria_quarto_ids
    if (next_categoria_ids.length === 0) {
      throw new TarifarioValidationError(
        'Selecione ao menos uma categoria de quarto.'
      )
    }

    for (const cat_id of next_categoria_ids) {
      const is_current = current.categoria_quarto_ids.includes(cat_id)
      const categoria = await this.categorias.find_by_id(cat_id, input.hotel_id)
      if (!categoria || (!categoria.is_ativa && !is_current)) {
        throw new CategoriaQuartoInativaError()
      }
    }

    const next_nome =
      input.nome !== undefined ? input.nome.trim() : current.nome
    if (!next_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (next_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.'
      )
    }

    const next_datas = normalize_datas(input.datas ?? current.datas)

    const next_valor =
      input.valor_diaria !== undefined
        ? normalize_valor_diaria(input.valor_diaria)
        : current.valor_diaria
    const next_ativo = input.ativo ?? current.ativo

    const next_minimo_diarias =
      input.minimo_diarias !== undefined
        ? input.minimo_diarias
        : current.minimo_diarias
    if (!Number.isInteger(next_minimo_diarias) || next_minimo_diarias < 1) {
      throw new TarifarioValidationError(
        'A quantidade mínima de diárias deve ser um número inteiro maior ou igual a 1.'
      )
    }

    const next_regime_id =
      input.regime_alimentacao_id !== undefined
        ? input.regime_alimentacao_id.trim()
        : current.regime_alimentacao_id
    if (!next_regime_id) {
      throw new TarifarioValidationError(
        'O regime de alimentação é obrigatório.'
      )
    }

    const next_parceiro_id =
      input.parceiro_id !== undefined
        ? input.parceiro_id || null
        : current.parceiro_id

    if (next_parceiro_id && this.parceiros) {
      const parceiro = await this.parceiros.find_by_id(
        next_parceiro_id,
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

    if (next_ativo) {
      const conflict = await this.tarifarios.find_overlapping_active({
        hotel_id: input.hotel_id,
        categoria_quarto_ids: next_categoria_ids,
        regime_alimentacao_id: next_regime_id,
        parceiro_id: next_parceiro_id,
        datas: next_datas,
        exclude_id: current.id,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    return this.tarifarios.update({
      id: current.id,
      hotel_id: input.hotel_id,
      categoria_quarto_id: next_categoria_ids[0],
      categoria_quarto_ids: next_categoria_ids,
      regime_alimentacao_id: next_regime_id,
      parceiro_id: next_parceiro_id,
      nome: next_nome,
      datas: next_datas,
      valor_diaria: next_valor,
      minimo_diarias: next_minimo_diarias,
      ativo: next_ativo,
    })
  }
}
