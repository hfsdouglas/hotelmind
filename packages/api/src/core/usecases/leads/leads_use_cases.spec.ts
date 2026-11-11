import { describe, expect, it } from 'vitest'
import {
  LeadNotFoundError,
  LeadValidationError,
} from '@/core/errors/lead_errors'
import { InMemoryLeadRepository } from '@/core/repositories/leads/in-memory/in_memory_lead_repository'
import { BuscarLeadUseCase } from './buscar_lead_use_case'
import { CriarLeadUseCase } from './criar_lead_use_case'
import { ListarLeadsUseCase } from './listar_leads_use_case'

const lead_data = (
  hotel_id: string,
  over: Partial<{ nome: string; telefone: string; email: string }> = {}
) => ({
  hotel_id,
  nome: 'Maria',
  telefone: '11999990000',
  email: 'maria@example.com',
  ...over,
})

describe('BuscarLeadUseCase', () => {
  it('retorna o lead do hotel', async () => {
    const repository = new InMemoryLeadRepository()
    const lead = await repository.create(lead_data('hA'))

    const result = await new BuscarLeadUseCase(repository).execute({
      id: lead.id,
      hotel_id: 'hA',
    })

    expect(result.id).toBe(lead.id)
  })

  it('lança not-found quando o lead não existe', async () => {
    const sut = new BuscarLeadUseCase(new InMemoryLeadRepository())
    await expect(
      sut.execute({ id: 'x', hotel_id: 'hA' })
    ).rejects.toBeInstanceOf(LeadNotFoundError)
  })

  it('não retorna lead de outro hotel (isolamento)', async () => {
    const repository = new InMemoryLeadRepository()
    const lead_b = await repository.create(lead_data('hB'))

    await expect(
      new BuscarLeadUseCase(repository).execute({
        id: lead_b.id,
        hotel_id: 'hA',
      })
    ).rejects.toBeInstanceOf(LeadNotFoundError)
  })
})

describe('CriarLeadUseCase', () => {
  it('cria um lead novo normalizando o e-mail', async () => {
    const repository = new InMemoryLeadRepository()

    const result = await new CriarLeadUseCase(repository).execute(
      lead_data('hA', { email: ' Maria@Example.com ' })
    )

    expect(result.email).toBe('maria@example.com')
    expect(repository.items).toHaveLength(1)
  })

  it('atualiza o lead existente com mesmo e-mail em vez de duplicar', async () => {
    const repository = new InMemoryLeadRepository()
    const sut = new CriarLeadUseCase(repository)
    const first = await sut.execute(lead_data('hA'))

    const second = await sut.execute(
      lead_data('hA', { nome: 'Maria Silva', telefone: '11888880000' })
    )

    expect(second.id).toBe(first.id)
    expect(second.nome).toBe('Maria Silva')
    expect(repository.items).toHaveLength(1)
  })

  it('atualiza o lead existente com mesmo telefone', async () => {
    const repository = new InMemoryLeadRepository()
    const sut = new CriarLeadUseCase(repository)
    const first = await sut.execute(lead_data('hA'))

    const second = await sut.execute(
      lead_data('hA', { nome: 'Outro', email: 'novo@example.com' })
    )

    expect(second.id).toBe(first.id)
    expect(second.email).toBe('novo@example.com')
    expect(repository.items).toHaveLength(1)
  })

  it('rejeita e-mail inválido', async () => {
    const sut = new CriarLeadUseCase(new InMemoryLeadRepository())
    await expect(
      sut.execute(lead_data('hA', { email: 'invalido' }))
    ).rejects.toBeInstanceOf(LeadValidationError)
  })

  it('rejeita nome vazio', async () => {
    const sut = new CriarLeadUseCase(new InMemoryLeadRepository())
    await expect(
      sut.execute(lead_data('hA', { nome: '   ' }))
    ).rejects.toBeInstanceOf(LeadValidationError)
  })

  it('cria lead separado para o mesmo contato em outro hotel (isolamento)', async () => {
    const repository = new InMemoryLeadRepository()
    const sut = new CriarLeadUseCase(repository)
    const lead_a = await sut.execute(lead_data('hA'))

    const lead_b = await sut.execute(lead_data('hB', { nome: 'Maria B' }))

    expect(lead_b.id).not.toBe(lead_a.id)
    expect(lead_b.hotel_id).toBe('hB')
    expect(repository.items.find(l => l.id === lead_a.id)?.nome).toBe('Maria')
  })
})

describe('ListarLeadsUseCase', () => {
  async function seed() {
    const repository = new InMemoryLeadRepository()
    await repository.create(
      lead_data('hA', { nome: 'Ana', email: 'ana@a.com', telefone: '111' })
    )
    await repository.create(
      lead_data('hA', { nome: 'Bruno', email: 'bruno@a.com', telefone: '222' })
    )
    await repository.create(
      lead_data('hA', { nome: 'Carla', email: 'carla@a.com', telefone: '333' })
    )
    await repository.create(
      lead_data('hB', { nome: 'Ana B', email: 'anab@b.com', telefone: '444' })
    )
    return new ListarLeadsUseCase(repository)
  }

  it('lista apenas leads do hotel (isolamento)', async () => {
    const sut = await seed()

    const result = await sut.execute({ hotel_id: 'hA', pagina: 1, limite: 50 })

    expect(result.meta.total).toBe(3)
    expect(result.data.every(l => l.hotel_id === 'hA')).toBe(true)
  })

  it('pagina os resultados', async () => {
    const sut = await seed()

    const result = await sut.execute({ hotel_id: 'hA', pagina: 2, limite: 2 })

    expect(result.data).toHaveLength(1)
    expect(result.meta).toMatchObject({
      pagina: 2,
      limite: 2,
      total: 3,
      ultima_pagina: 2,
    })
  })

  it('filtra por busca no nome sem vazar outro hotel', async () => {
    const sut = await seed()

    const result = await sut.execute({
      hotel_id: 'hA',
      pagina: 1,
      limite: 50,
      busca: 'ana',
    })

    expect(result.data.map(l => l.nome)).toEqual(['Ana'])
  })

  it('filtra por busca no telefone', async () => {
    const sut = await seed()

    const result = await sut.execute({
      hotel_id: 'hA',
      pagina: 1,
      limite: 50,
      busca: '222',
    })

    expect(result.data.map(l => l.nome)).toEqual(['Bruno'])
  })
})
