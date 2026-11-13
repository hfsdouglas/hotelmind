import { beforeEach, describe, expect, it } from 'vitest'
import {
  ReservaNotFoundError,
  ReservaTransicaoInvalidaError,
} from '@/core/errors/reserva_errors'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { AlterarStatusReservaUseCase } from './alterar_status_reserva_use_case'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'
const USER_ID = 'user-1'

describe('AlterarStatusReservaUseCase', () => {
  let repo: InMemoryReservaRepository
  let use_case: AlterarStatusReservaUseCase

  async function criar_reserva(
    hotel_id: string,
    status: 'a_confirmar' | 'confirmada' | 'check_in'
  ) {
    return repo.create({
      hotel_id,
      codigo: 'RES-0101',
      titular_nome: 'Ana Souza',
      quarto_id: 'quarto-101',
      regime_alimentacao_id: 'regime-1',
      check_in: '2026-12-02',
      check_out: '2026-12-04',
      quantidade_adultos: 2,
      valor_total: '1500.00',
      detalhamento_diarias: [],
      token_fnrh: 'token-1234567890abcdef12345678',
      status,
    })
  }

  beforeEach(() => {
    repo = new InMemoryReservaRepository(new InMemoryReservaHospedeRepository())
    use_case = new AlterarStatusReservaUseCase(repo)
  })

  it('realiza check-in de reserva confirmada e registra o histórico', async () => {
    const reserva = await criar_reserva(HOTEL_A, 'confirmada')

    const result = await use_case.execute({
      reserva_id: reserva.id,
      hotel_id: HOTEL_A,
      status_novo: 'check_in',
      user_id: USER_ID,
    })

    expect(result.status).toBe('check_in')
    expect(repo.historico).toHaveLength(1)
    expect(repo.historico[0]).toMatchObject({
      reserva_id: reserva.id,
      status_anterior: 'confirmada',
      status_novo: 'check_in',
      user_id: USER_ID,
    })
  })

  it('rejeita check-in de reserva a_confirmar sem alterar status nem histórico', async () => {
    const reserva = await criar_reserva(HOTEL_A, 'a_confirmar')

    await expect(
      use_case.execute({
        reserva_id: reserva.id,
        hotel_id: HOTEL_A,
        status_novo: 'check_in',
        user_id: USER_ID,
      })
    ).rejects.toBeInstanceOf(ReservaTransicaoInvalidaError)

    expect((await repo.find_by_id(reserva.id, HOTEL_A))?.status).toBe(
      'a_confirmar'
    )
    expect(repo.historico).toHaveLength(0)
  })

  it('não altera reserva de outro hotel (isolamento entre hotéis)', async () => {
    const reserva = await criar_reserva(HOTEL_A, 'confirmada')

    await expect(
      use_case.execute({
        reserva_id: reserva.id,
        hotel_id: HOTEL_B,
        status_novo: 'check_in',
        user_id: USER_ID,
      })
    ).rejects.toBeInstanceOf(ReservaNotFoundError)

    expect((await repo.find_by_id(reserva.id, HOTEL_A))?.status).toBe(
      'confirmada'
    )
    expect(repo.historico).toHaveLength(0)
  })

  it('trata check_in para check_in como no-op sem erro', async () => {
    const reserva = await criar_reserva(HOTEL_A, 'check_in')

    const result = await use_case.execute({
      reserva_id: reserva.id,
      hotel_id: HOTEL_A,
      status_novo: 'check_in',
      user_id: USER_ID,
    })

    expect(result.status).toBe('check_in')
  })
})
