import { describe, expect, it } from 'vitest'
import {
  CategoriaQuartoConflictError,
  CategoriaQuartoNotFoundError,
} from '@/core/errors/categoria_quarto_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { AtualizarCategoriaQuartoUseCase } from './atualizar_categoria_quarto_use_case'

function make_sut() {
  const repository = new InMemoryCategoriaQuartoRepository()
  return { repository, sut: new AtualizarCategoriaQuartoUseCase(repository) }
}

describe('AtualizarCategoriaQuartoUseCase', () => {
  it('atualiza nome (aparado) e status da categoria', async () => {
    const { repository, sut } = make_sut()
    const cat = await repository.create({ hotel_id: 'h1', nome: 'Suíte' })

    const result = await sut.execute({
      id: cat.id,
      hotel_id: 'h1',
      nome: '  Luxo  ',
      status: 'N',
    })

    expect(result.nome).toBe('Luxo')
    expect(result.status).toBe('N')
  })

  it('permite manter o próprio nome ignorando caixa', async () => {
    const { repository, sut } = make_sut()
    const cat = await repository.create({ hotel_id: 'h1', nome: 'Suíte' })

    const result = await sut.execute({
      id: cat.id,
      hotel_id: 'h1',
      nome: 'SUÍTE',
      status: 'S',
    })

    expect(result.nome).toBe('SUÍTE')
  })

  it('lança not-found quando a categoria não existe', async () => {
    const { sut } = make_sut()
    await expect(
      sut.execute({ id: 'x', hotel_id: 'h1', nome: 'A', status: 'S' })
    ).rejects.toBeInstanceOf(CategoriaQuartoNotFoundError)
  })

  it('lança conflito quando outra categoria do hotel tem o mesmo nome ignorando caixa', async () => {
    const { repository, sut } = make_sut()
    await repository.create({ hotel_id: 'h1', nome: 'Suíte' })
    const other = await repository.create({ hotel_id: 'h1', nome: 'Luxo' })

    await expect(
      sut.execute({ id: other.id, hotel_id: 'h1', nome: 'SUÍTE', status: 'S' })
    ).rejects.toBeInstanceOf(CategoriaQuartoConflictError)
  })

  // BUG conhecido: o use case envia `busca: data.nome` sem trim, então nome com
  // espaços nas bordas não encontra a categoria duplicada. Remover `.fails`
  // quando o use case passar `data.nome.trim()` na busca.
  it.fails('lança conflito para nome duplicado com espaços nas bordas', async () => {
    const { repository, sut } = make_sut()
    await repository.create({ hotel_id: 'h1', nome: 'Suíte' })
    const other = await repository.create({ hotel_id: 'h1', nome: 'Luxo' })

    await expect(
      sut.execute({
        id: other.id,
        hotel_id: 'h1',
        nome: ' suíte ',
        status: 'S',
      })
    ).rejects.toBeInstanceOf(CategoriaQuartoConflictError)
  })

  it('converte erro de unicidade do repositório (P2002) em conflito', async () => {
    const { repository, sut } = make_sut()
    const cat = await repository.create({ hotel_id: 'h1', nome: 'Suíte' })
    repository.update = async () => {
      throw { code: 'P2002' }
    }

    await expect(
      sut.execute({ id: cat.id, hotel_id: 'h1', nome: 'Novo', status: 'S' })
    ).rejects.toBeInstanceOf(CategoriaQuartoConflictError)
  })

  it('não atualiza categoria de outro hotel (isolamento)', async () => {
    const { repository, sut } = make_sut()
    const cat_b = await repository.create({ hotel_id: 'hB', nome: 'Suíte' })

    await expect(
      sut.execute({ id: cat_b.id, hotel_id: 'hA', nome: 'Hack', status: 'N' })
    ).rejects.toBeInstanceOf(CategoriaQuartoNotFoundError)
    const untouched = await repository.find_by_id(cat_b.id, 'hB')
    expect(untouched?.nome).toBe('Suíte')
    expect(untouched?.status).toBe('S')
  })

  it('não considera nomes de outro hotel como conflito', async () => {
    const { repository, sut } = make_sut()
    await repository.create({ hotel_id: 'hB', nome: 'Suíte' })
    const cat_a = await repository.create({ hotel_id: 'hA', nome: 'Luxo' })

    const result = await sut.execute({
      id: cat_a.id,
      hotel_id: 'hA',
      nome: 'Suíte',
      status: 'S',
    })

    expect(result.nome).toBe('Suíte')
  })
})
