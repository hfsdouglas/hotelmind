import { describe, expect, it } from 'vitest'
import {
  CategoriaQuartoInativaError,
  QuartoConflictError,
  QuartoNotFoundError,
} from '@/core/errors/quarto_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import { AtualizarQuartoUseCase } from './atualizar_quarto_use_case'
import { CriarQuartoUseCase } from './criar_quarto_use_case'
import { ListarQuartosUseCase } from './listar_quartos_use_case'

function make_deps() {
  return {
    quartos: new InMemoryQuartoRepository(),
    categorias: new InMemoryCategoriaQuartoRepository(),
  }
}

const quarto_data = (
  hotel_id: string,
  categoria_id: string,
  over: Record<string, unknown> = {}
) => ({
  hotel_id,
  categoria_id,
  identificacao: '101',
  limite_hospedes: 2,
  camas: [{ tipo: 'casal' as const, quantidade: 1 }],
  ...over,
})

describe('CriarQuartoUseCase', () => {
  it('cria quarto em categoria ativa do hotel', async () => {
    const { quartos, categorias } = make_deps()
    const cat = await categorias.create({ hotel_id: 'hA', nome: 'Suíte' })

    const result = await new CriarQuartoUseCase(quartos, categorias).execute(
      quarto_data('hA', cat.id)
    )

    expect(result.hotel_id).toBe('hA')
    expect(result.categoria_id).toBe(cat.id)
    expect(quartos.items).toHaveLength(1)
  })

  it('rejeita categoria inativa', async () => {
    const { quartos, categorias } = make_deps()
    const cat = await categorias.create({
      hotel_id: 'hA',
      nome: 'Suíte',
      status: 'N',
    })

    await expect(
      new CriarQuartoUseCase(quartos, categorias).execute(
        quarto_data('hA', cat.id)
      )
    ).rejects.toBeInstanceOf(CategoriaQuartoInativaError)
    expect(quartos.items).toHaveLength(0)
  })

  it('rejeita categoria inexistente', async () => {
    const { quartos, categorias } = make_deps()

    await expect(
      new CriarQuartoUseCase(quartos, categorias).execute(
        quarto_data('hA', 'nope')
      )
    ).rejects.toBeInstanceOf(CategoriaQuartoInativaError)
  })

  it('rejeita categoria de outro hotel (isolamento)', async () => {
    const { quartos, categorias } = make_deps()
    const cat_b = await categorias.create({ hotel_id: 'hB', nome: 'Suíte' })

    await expect(
      new CriarQuartoUseCase(quartos, categorias).execute(
        quarto_data('hA', cat_b.id)
      )
    ).rejects.toBeInstanceOf(CategoriaQuartoInativaError)
    expect(quartos.items).toHaveLength(0)
  })

  it('converte erro de unicidade (P2002) em conflito', async () => {
    const { quartos, categorias } = make_deps()
    const cat = await categorias.create({ hotel_id: 'hA', nome: 'Suíte' })
    quartos.create = async () => {
      throw { code: 'P2002' }
    }

    await expect(
      new CriarQuartoUseCase(quartos, categorias).execute(
        quarto_data('hA', cat.id)
      )
    ).rejects.toBeInstanceOf(QuartoConflictError)
  })

  it('propaga erros de domínio da entidade (limite de hóspedes inválido)', async () => {
    const { quartos, categorias } = make_deps()
    const cat = await categorias.create({ hotel_id: 'hA', nome: 'Suíte' })

    await expect(
      new CriarQuartoUseCase(quartos, categorias).execute(
        quarto_data('hA', cat.id, { limite_hospedes: 0 })
      )
    ).rejects.toThrow('limite de hóspedes')
  })
})

describe('AtualizarQuartoUseCase', () => {
  async function seed() {
    const { quartos, categorias } = make_deps()
    const cat = await categorias.create({ hotel_id: 'hA', nome: 'Suíte' })
    const quarto = await quartos.create(quarto_data('hA', cat.id))
    const sut = new AtualizarQuartoUseCase(quartos, categorias)
    return { quartos, categorias, cat, quarto, sut }
  }

  it('atualiza os dados do quarto', async () => {
    const { cat, quarto, sut } = await seed()

    const result = await sut.execute({
      ...quarto_data('hA', cat.id, {
        identificacao: '202',
        limite_hospedes: 4,
      }),
      id: quarto.id,
      status: 'N',
    })

    expect(result.identificacao).toBe('202')
    expect(result.limite_hospedes).toBe(4)
    expect(result.status).toBe('N')
  })

  it('lança not-found quando o quarto não existe', async () => {
    const { cat, sut } = await seed()

    await expect(
      sut.execute({ ...quarto_data('hA', cat.id), id: 'x', status: 'S' })
    ).rejects.toBeInstanceOf(QuartoNotFoundError)
  })

  it('rejeita troca para categoria inativa', async () => {
    const { categorias, quarto, sut } = await seed()
    const inativa = await categorias.create({
      hotel_id: 'hA',
      nome: 'Velha',
      status: 'N',
    })

    await expect(
      sut.execute({
        ...quarto_data('hA', inativa.id),
        id: quarto.id,
        status: 'S',
      })
    ).rejects.toBeInstanceOf(CategoriaQuartoInativaError)
  })

  it('permite manter a categoria atual mesmo se ela foi inativada', async () => {
    const { categorias, cat, quarto, sut } = await seed()
    await categorias.update({
      id: cat.id,
      hotel_id: 'hA',
      nome: 'Suíte',
      status: 'N',
    })

    const result = await sut.execute({
      ...quarto_data('hA', cat.id, { identificacao: '303' }),
      id: quarto.id,
      status: 'S',
    })

    expect(result.identificacao).toBe('303')
  })

  it('converte erro de unicidade (P2002) em conflito', async () => {
    const { quartos, cat, quarto, sut } = await seed()
    quartos.update = async () => {
      throw { code: 'P2002' }
    }

    await expect(
      sut.execute({ ...quarto_data('hA', cat.id), id: quarto.id, status: 'S' })
    ).rejects.toBeInstanceOf(QuartoConflictError)
  })

  it('não atualiza quarto de outro hotel (isolamento)', async () => {
    const { quartos, categorias, sut } = await seed()
    const cat_b = await categorias.create({ hotel_id: 'hB', nome: 'Suíte' })
    const quarto_b = await quartos.create(quarto_data('hB', cat_b.id))

    await expect(
      sut.execute({
        ...quarto_data('hA', cat_b.id, { identificacao: 'hack' }),
        id: quarto_b.id,
        status: 'N',
      })
    ).rejects.toBeInstanceOf(QuartoNotFoundError)
    const untouched = await quartos.find_by_id(quarto_b.id, 'hB')
    expect(untouched?.identificacao).toBe('101')
  })

  it('rejeita categoria de outro hotel ao atualizar quarto próprio (isolamento)', async () => {
    const { categorias, quarto, sut } = await seed()
    const cat_b = await categorias.create({ hotel_id: 'hB', nome: 'Suíte B' })

    await expect(
      sut.execute({
        ...quarto_data('hA', cat_b.id),
        id: quarto.id,
        status: 'S',
      })
    ).rejects.toBeInstanceOf(CategoriaQuartoInativaError)
  })
})

describe('ListarQuartosUseCase', () => {
  async function seed() {
    const { quartos, categorias } = make_deps()
    const c1 = await categorias.create({ hotel_id: 'hA', nome: 'Suíte' })
    const c2 = await categorias.create({ hotel_id: 'hA', nome: 'Standard' })
    const cb = await categorias.create({ hotel_id: 'hB', nome: 'Suíte' })
    await quartos.create(quarto_data('hA', c1.id, { identificacao: '101' }))
    await quartos.create(quarto_data('hA', c1.id, { identificacao: '102' }))
    await quartos.create(quarto_data('hA', c2.id, { identificacao: '201' }))
    await quartos.create(quarto_data('hB', cb.id, { identificacao: '101' }))
    return { sut: new ListarQuartosUseCase(quartos), c1, c2 }
  }

  it('lista apenas quartos do hotel (isolamento)', async () => {
    const { sut } = await seed()

    const result = await sut.execute('hA', { pagina: 1, limite: 50 })

    expect(result.meta.total).toBe(3)
    expect(result.data.every(q => q.hotel_id === 'hA')).toBe(true)
  })

  it('pagina os resultados', async () => {
    const { sut } = await seed()

    const result = await sut.execute('hA', { pagina: 2, limite: 2 })

    expect(result.data).toHaveLength(1)
    expect(result.meta).toEqual({
      pagina: 2,
      limite: 2,
      total: 3,
      ultima_pagina: 2,
    })
  })

  it('filtra por busca na identificação', async () => {
    const { sut } = await seed()

    const result = await sut.execute('hA', {
      pagina: 1,
      limite: 50,
      busca: '20',
    })

    expect(result.data.map(q => q.identificacao)).toEqual(['201'])
  })

  it('filtra por categoria', async () => {
    const { sut, c1 } = await seed()

    const result = await sut.execute('hA', {
      pagina: 1,
      limite: 50,
      categoria_id: [c1.id],
    })

    expect(result.data.map(q => q.identificacao).sort()).toEqual(['101', '102'])
  })

  it('filtra por status', async () => {
    const { sut } = await seed()

    const result = await sut.execute('hA', {
      pagina: 1,
      limite: 50,
      status: 'N',
    })

    expect(result.data).toEqual([])
  })
})
