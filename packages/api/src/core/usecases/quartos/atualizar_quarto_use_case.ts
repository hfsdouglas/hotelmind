import type { Quarto } from '@/core/entities/quarto'
import { CategoriaQuartoInativaError, QuartoConflictError, QuartoNotFoundError } from '@/core/errors/quarto_errors'
import type { ICategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { IQuartoRepository, UpdateQuartoData } from '@/core/repositories/quartos/quarto.repository'

export class AtualizarQuartoUseCase {
  constructor(private readonly quartos: IQuartoRepository, private readonly categorias: ICategoriaQuartoRepository) {}

  async execute(data: UpdateQuartoData): Promise<Quarto> {
    const current = await this.quartos.find_by_id(data.id, data.hotel_id)
    if (!current) throw new QuartoNotFoundError()
    const category = await this.categorias.find_by_id(data.categoria_id, data.hotel_id)
    const keeping_current_category = data.categoria_id === current.categoria_id
    if (!category || (!category.is_ativa && !keeping_current_category)) throw new CategoriaQuartoInativaError()
    try {
      return await this.quartos.update(data)
    } catch (error) {
      if (is_unique_error(error)) throw new QuartoConflictError()
      throw error
    }
  }
}

function is_unique_error(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}
