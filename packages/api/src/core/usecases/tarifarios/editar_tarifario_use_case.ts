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
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export interface EditarTarifarioInput {
  id: string
  hotel_id: string
  categoria_quarto_id?: string
  nome?: string
  datas?: string[]
  valor_diaria?: string
  ativo?: boolean
}

export class EditarTarifarioUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository,
  ) {}

  async execute(input: EditarTarifarioInput): Promise<Tarifario> {
    const current = await this.tarifarios.find_by_id(input.id, input.hotel_id)
    if (!current) {
      throw new TarifarioNotFoundError()
    }

    const next_categoria_id =
      input.categoria_quarto_id ?? current.categoria_quarto_id
    const keeping_current_category =
      next_categoria_id === current.categoria_quarto_id

    const categoria = await this.categorias.find_by_id(
      next_categoria_id,
      input.hotel_id,
    )
    if (!categoria || (!categoria.is_ativa && !keeping_current_category)) {
      throw new CategoriaQuartoInativaError()
    }

    const next_nome =
      input.nome !== undefined ? input.nome.trim() : current.nome
    if (!next_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (next_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.',
      )
    }

    const next_datas = normalize_datas(input.datas ?? current.datas)

    const next_valor =
      input.valor_diaria !== undefined
        ? normalize_valor_diaria(input.valor_diaria)
        : current.valor_diaria
    const next_ativo = input.ativo ?? current.ativo

    if (next_ativo) {
      const conflict = await this.tarifarios.find_overlapping_active({
        hotel_id: input.hotel_id,
        categoria_quarto_id: next_categoria_id,
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
      categoria_quarto_id: next_categoria_id,
      nome: next_nome,
      datas: next_datas,
      valor_diaria: next_valor,
      ativo: next_ativo,
    })
  }
}
