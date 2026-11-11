import { describe, expect, it } from 'vitest'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { ListarCategoriasQuartoUseCase } from './listar_categorias_quarto_use_case'

async function make_sut() {
  const repository = new InMemoryCategoriaQuartoRepository()
  await repository.create({ hotel_id: 'hA', nome: 'Suíte' })
  await repository.create({ hotel_id: 'hA', nome: 'Standard' })
  await repository.create({ hotel_id: 'hA', nome: 'Luxo', status: 'N' })
  await repository.create({ hotel_id: 'hB', nome: 'Suíte B' })
  return new ListarCategoriasQuartoUseCase(repository)
}

describe('ListarCategoriasQuartoUseCase', () => {
  it('lista apenas categorias do hotel informado (isolamento)', async () => {
    const sut = await make_sut()

    const result = await sut.execute('hA', { pagina: 1, limite: 50 })

    expect(result.meta.total).toBe(3)
    expect(result.data.every(c => c.hotel_id === 'hA')).toBe(true)
    expect(result.data.map(c => c.nome)).not.toContain('Suíte B')
  })

  it('não retorna dados quando o hotel não possui categorias', async () => {
    const sut = await make_sut()

    const result = await sut.execute('hC', { pagina: 1, limite: 50 })

    expect(result.data).toEqual([])
    expect(result.meta).toEqual({
      pagina: 1,
      limite: 50,
      total: 0,
      ultima_pagina: 1,
    })
  })

  it('pagina os resultados e calcula a última página', async () => {
    const sut = await make_sut()

    const page_2 = await sut.execute('hA', { pagina: 2, limite: 2 })

    expect(page_2.data).toHaveLength(1)
    expect(page_2.meta).toEqual({
      pagina: 2,
      limite: 2,
      total: 3,
      ultima_pagina: 2,
    })
  })

  it('filtra por busca ignorando caixa, sem vazar outro hotel', async () => {
    const sut = await make_sut()

    const result = await sut.execute('hA', {
      pagina: 1,
      limite: 50,
      busca: 'SUÍ',
    })

    expect(result.data.map(c => c.nome)).toEqual(['Suíte'])
  })

  it('filtra por status', async () => {
    const sut = await make_sut()

    const result = await sut.execute('hA', {
      pagina: 1,
      limite: 50,
      status: 'N',
    })

    expect(result.data.map(c => c.nome)).toEqual(['Luxo'])
  })
})
