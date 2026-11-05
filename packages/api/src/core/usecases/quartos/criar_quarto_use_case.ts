import type { Quarto } from '@/core/entities/quarto'
import {
  CategoriaQuartoInativaError,
  QuartoConflictError,
} from '@/core/errors/quarto_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type {
  CreateQuartoData,
  IQuartoRepository,
} from '@/core/repositories/quartos/quarto.repository'

export class CriarQuartoUseCase {
  constructor(
    private readonly quartos: IQuartoRepository,
    private readonly categorias: ICategoriaQuartoRepository
  ) {}

  async execute(data: CreateQuartoData): Promise<Quarto> {
    const category = await this.categorias.find_by_id(
      data.categoria_id,
      data.hotel_id
    )
    if (!category?.is_ativa) throw new CategoriaQuartoInativaError()
    try {
      return await this.quartos.create(data)
    } catch (error) {
      if (is_unique_error(error)) throw new QuartoConflictError()
      throw error
    }
  }
}

function is_unique_error(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}
