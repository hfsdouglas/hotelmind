import type { Tarifario } from '@/core/entities/tarifario'
import {
  is_valid_iso_date,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioPeriodConflictError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'

export interface CriarTarifarioInput {
  hotel_id: string
  categoria_quarto_id: string
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  ativo?: boolean
}

export class CriarTarifarioUseCase {
  constructor(
    private readonly tarifarios: ITarifarioRepository,
    private readonly categorias: ICategoriaQuartoRepository,
  ) {}

  async execute(input: CriarTarifarioInput): Promise<Tarifario> {
    const trimmed_nome = input.nome.trim()
    if (!trimmed_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (trimmed_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.',
      )
    }
    if (
      !is_valid_iso_date(input.data_inicio) ||
      !is_valid_iso_date(input.data_fim)
    ) {
      throw new TarifarioValidationError('As datas informadas são inválidas.')
    }
    if (input.data_inicio >= input.data_fim) {
      throw new TarifarioValidationError(
        'A data de início deve ser anterior à data de término.',
      )
    }
    const valor_diaria = normalize_valor_diaria(input.valor_diaria)
    const ativo = input.ativo ?? true

    const categoria = await this.categorias.find_by_id(
      input.categoria_quarto_id,
      input.hotel_id,
    )
    if (!categoria?.is_ativa) {
      throw new CategoriaQuartoInativaError()
    }

    if (ativo) {
      const conflict = await this.tarifarios.find_overlapping_active({
        hotel_id: input.hotel_id,
        categoria_quarto_id: input.categoria_quarto_id,
        data_inicio: input.data_inicio,
        data_fim: input.data_fim,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    return this.tarifarios.create({
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      nome: trimmed_nome,
      data_inicio: input.data_inicio,
      data_fim: input.data_fim,
      valor_diaria,
      ativo,
    })
  }
}
