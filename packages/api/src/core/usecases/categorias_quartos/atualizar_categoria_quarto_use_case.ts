import type { CategoriaQuarto } from '@/core/entities/categoria_quarto'
import {
  CategoriaQuartoConflictError,
  CategoriaQuartoNotFoundError,
} from '@/core/errors/categoria_quarto_errors'
import type {
  ICategoriaQuartoRepository,
  UpdateCategoriaQuartoData,
} from '@/core/repositories/categorias_quartos/categoria_quarto.repository'

export class AtualizarCategoriaQuartoUseCase {
  constructor(private readonly repository: ICategoriaQuartoRepository) {}

  async execute(data: UpdateCategoriaQuartoData): Promise<CategoriaQuarto> {
    const current = await this.repository.find_by_id(data.id, data.hotel_id)
    if (!current) throw new CategoriaQuartoNotFoundError()
    const normalized = data.nome.trim().toLocaleLowerCase()
    const categories = await this.repository.list(data.hotel_id, {
      pagina: 1,
      limite: 250,
      busca: data.nome,
    })
    if (
      categories.data.some(
        category =>
          category.id !== data.id &&
          category.nome.trim().toLocaleLowerCase() === normalized
      )
    )
      throw new CategoriaQuartoConflictError()
    try {
      return await this.repository.update({ ...data, nome: data.nome.trim() })
    } catch (error) {
      if (is_unique_error(error)) throw new CategoriaQuartoConflictError()
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
