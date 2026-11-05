import { beforeEach, describe, expect, it } from 'vitest'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { BuscarReservaUseCase } from './buscar_reserva_use_case'
import { ListarReservasUseCase } from './listar_reservas_use_case'

describe('ListarReservasUseCase & BuscarReservaUseCase', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let listar_use_case: ListarReservasUseCase
  let buscar_use_case: BuscarReservaUseCase

  const hotel_id = 'hotel-list-123'

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    listar_use_case = new ListarReservasUseCase(reservas_repo)
    buscar_use_case = new BuscarReservaUseCase(reservas_repo)

    const r1 = await reservas_repo.create({
      hotel_id,
      codigo: 'RES-000001',
      titular_nome: 'Lucas Silva',
      quarto_id: 'q1',
      regime_alimentacao_id: 'r1',
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 2,
      valor_total: '500.00',
      detalhamento_diarias: [],
      status: 'confirmada',
      token_fnrh: 'token-lucas',
    })

    await hospedes_repo.create_many([
      {
        reserva_id: r1.id,
        posicao: 1,
        ficha_status: 'preenchida',
        nome_completo: 'Lucas Silva',
      },
      { reserva_id: r1.id, posicao: 2, ficha_status: 'pendente' },
    ])

    await reservas_repo.create({
      hotel_id,
      codigo: 'RES-000002',
      titular_nome: 'Ana Paula',
      quarto_id: 'q2',
      regime_alimentacao_id: 'r2',
      check_in: '2026-12-05',
      check_out: '2026-12-08',
      quantidade_adultos: 1,
      valor_total: '600.00',
      detalhamento_diarias: [],
      status: 'a_confirmar',
      token_fnrh: 'token-ana',
    })
  })

  it('deve listar reservas do hotel com paginação', async () => {
    const res = await listar_use_case.execute({
      hotel_id,
      pagina: 1,
      limite: 10,
    })
    expect(res.data).toHaveLength(2)
    expect(res.meta.total).toBe(2)
  })

  it('deve filtrar por status', async () => {
    const res = await listar_use_case.execute({
      hotel_id,
      status: 'confirmada',
    })
    expect(res.data).toHaveLength(1)
    expect(res.data[0].codigo).toBe('RES-000001')
    expect(res.data[0].fichas_preenchidas).toBe(1)
    expect(res.data[0].total_hospedes).toBe(2)
  })

  it('deve buscar por id com lista de hóspedes inclusa', async () => {
    const list = await listar_use_case.execute({ hotel_id })
    const r1 = list.data.find(r => r.codigo === 'RES-000001')
    expect(r1).toBeDefined()
    if (!r1) return

    const found = await buscar_use_case.execute({ id: r1.id, hotel_id })
    expect(found.id).toBe(r1.id)
    expect(found.hospedes).toHaveLength(2)
  })
})
