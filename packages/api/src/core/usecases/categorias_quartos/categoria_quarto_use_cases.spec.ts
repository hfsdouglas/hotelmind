import { describe, expect, it } from 'vitest'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { CriarCategoriaQuartoUseCase } from './criar_categoria_quarto_use_case'

describe('CriarCategoriaQuartoUseCase', () => {
  it('rejects duplicate names ignoring case', async () => {
    const repository = new InMemoryCategoriaQuartoRepository()
    const use_case = new CriarCategoriaQuartoUseCase(repository)
    await use_case.execute({ hotel_id: 'h1', nome: 'Suíte' })
    await expect(use_case.execute({ hotel_id: 'h1', nome: ' suíte ' })).rejects.toThrow('Já existe')
  })
})
