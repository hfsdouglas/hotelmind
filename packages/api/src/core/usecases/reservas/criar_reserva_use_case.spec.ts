import { beforeEach, describe, expect, it } from 'vitest'
import type { Quarto } from '@/core/entities/quarto'
import type { RegimeAlimentacao } from '@/core/entities/regime_alimentacao'
import {
  ReservaConflitoError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { ConsultarDisponibilidadeUseCase } from './consultar_disponibilidade_use_case'
import { CriarReservaUseCase } from './criar_reserva_use_case'

describe('CriarReservaUseCase & ConsultarDisponibilidadeUseCase', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let quartos_repo: InMemoryQuartoRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let disponibilidade_use_case: ConsultarDisponibilidadeUseCase
  let use_case: CriarReservaUseCase

  const hotel_id = 'hotel-123'
  const categoria_id = 'cat-luxo'
  let regime: RegimeAlimentacao
  let quarto1: Quarto
  let quarto2: Quarto

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    quartos_repo = new InMemoryQuartoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()

    disponibilidade_use_case = new ConsultarDisponibilidadeUseCase(
      reservas_repo,
      quartos_repo,
      tarifarios_repo
    )

    use_case = new CriarReservaUseCase(
      reservas_repo,
      hospedes_repo,
      quartos_repo,
      regimes_repo,
      tarifarios_repo,
      undefined,
      undefined,
      disponibilidade_use_case
    )

    regime = await regimes_repo.create({
      hotel_id,
      titulo: 'Café da Manhã',
      cor_pulseira: '#22c55e',
      ativo: true,
    })

    quarto1 = await quartos_repo.create({
      hotel_id,
      categoria_id,
      identificacao: '101',
      limite_hospedes: 3,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })

    quarto2 = await quartos_repo.create({
      hotel_id,
      categoria_id,
      identificacao: '102',
      limite_hospedes: 4,
      camas: [{ tipo: 'casal', quantidade: 2 }],
    })

    // Cadastrar tarifário de 2026-12-01 até 2026-12-10 (R$ 250,00 por noite)
    await tarifarios_repo.create({
      hotel_id,
      categoria_quarto_id: categoria_id,
      regime_alimentacao_id: regime.id,
      nome: 'Tarifário Padrão Luxo',
      valor_diaria: '250.00',
      datas: [
        '2026-12-01',
        '2026-12-02',
        '2026-12-03',
        '2026-12-04',
        '2026-12-05',
        '2026-12-06',
        '2026-12-07',
      ],
      ativo: true,
    })
  })

  it('deve cadastrar uma reserva com sucesso, congelando tarifas e criando posições de hóspedes', async () => {
    const reserva = await use_case.execute({
      hotel_id,
      titular_nome: 'Carlos Silva',
      titular_telefone: '11999998888',
      titular_email: 'carlos@exemplo.com',
      quarto_id: quarto1.id,
      regime_alimentacao_id: regime.id,
      check_in: '2026-12-01',
      check_out: '2026-12-04', // 3 noites
      quantidade_adultos: 2,
      quantidade_criancas: 1, // 3 pessoas
    })

    expect(reserva.id).toBeDefined()
    expect(reserva.codigo).toBe('FR-000001')
    expect(reserva.status).toBe('a_confirmar')
    expect(reserva.valor_total).toBe('750.00') // 3 x 250
    expect(reserva.detalhamento_diarias).toHaveLength(3)
    expect(reserva.token_fnrh).toBeDefined()
    expect(reserva.token_fnrh.length).toBeGreaterThan(20)

    expect(reserva.hospedes).toHaveLength(3)
    expect(reserva.hospedes?.[0].posicao).toBe(1)
    expect(reserva.hospedes?.[0].nome_completo).toBe('Carlos Silva')
    expect(reserva.hospedes?.[0].ficha_status).toBe('pendente')

    expect(reserva.hospedes?.[1].posicao).toBe(2)
    expect(reserva.hospedes?.[1].nome_completo).toBeNull()

    expect(reserva.hospedes?.[2].posicao).toBe(3)
    expect(reserva.hospedes?.[2].nome_completo).toBeNull()
  })

  it('deve rejeitar reserva com check-out anterior ou igual ao check-in', async () => {
    await expect(
      use_case.execute({
        hotel_id,
        titular_nome: 'Carlos',
        quarto_id: quarto1.id,
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-03',
        check_out: '2026-12-01',
        quantidade_adultos: 1,
      })
    ).rejects.toThrow(ReservaValidationError)
  })

  it('deve rejeitar reserva se quantidade de pessoas exceder a capacidade do quarto', async () => {
    await expect(
      use_case.execute({
        hotel_id,
        titular_nome: 'Carlos',
        quarto_id: quarto1.id, // limite 3
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-01',
        check_out: '2026-12-03',
        quantidade_adultos: 3,
        quantidade_criancas: 1, // total 4 > 3
      })
    ).rejects.toThrow(ReservaValidationError)
  })

  it('deve rejeitar reserva se não houver cobertura de tarifa para o período', async () => {
    await expect(
      use_case.execute({
        hotel_id,
        titular_nome: 'Carlos',
        quarto_id: quarto1.id,
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-05',
        check_out: '2026-12-10', // faltam tarifas para 07 a 10
        quantidade_adultos: 2,
      })
    ).rejects.toThrow(TarifarioSemCoberturaError)
  })

  it('deve bloquear reserva em conflito e sugerir quartos alternativos disponíveis', async () => {
    // 1. Criar primeira reserva no quarto 101 de 01 a 04
    await use_case.execute({
      hotel_id,
      titular_nome: 'Primeiro Hóspede',
      quarto_id: quarto1.id,
      regime_alimentacao_id: regime.id,
      check_in: '2026-12-01',
      check_out: '2026-12-04',
      quantidade_adultos: 2,
    })

    // 2. Tentar reservar o mesmo quarto 101 com datas sobrepostas (02 a 05)
    let erro_conflito: ReservaConflitoError | null = null
    try {
      await use_case.execute({
        hotel_id,
        titular_nome: 'Segundo Hóspede',
        quarto_id: quarto1.id,
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-02',
        check_out: '2026-12-05',
        quantidade_adultos: 2,
      })
    } catch (err) {
      if (err instanceof ReservaConflitoError) {
        erro_conflito = err
      }
    }

    expect(erro_conflito).not.toBeNull()
    expect(erro_conflito?.alternativas).toBeDefined()
    // O quarto 102 está livre e com tarifa vigente para o período
    expect(
      erro_conflito?.alternativas.some(a => a.quarto_id === quarto2.id)
    ).toBe(true)
  })

  it('não deve considerar conflito quando o check-in de uma reserva é no mesmo dia do check-out da outra', async () => {
    // 1. Reserva no quarto 101 de 01 a 03
    await use_case.execute({
      hotel_id,
      titular_nome: 'Primeiro',
      quarto_id: quarto1.id,
      regime_alimentacao_id: regime.id,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 2,
    })

    // 2. Segunda reserva no quarto 101 entrando em 03 e saindo em 05 (mesmo dia do check-out anterior)
    const segunda = await use_case.execute({
      hotel_id,
      titular_nome: 'Segundo',
      quarto_id: quarto1.id,
      regime_alimentacao_id: regime.id,
      check_in: '2026-12-03',
      check_out: '2026-12-05',
      quantidade_adultos: 2,
    })

    expect(segunda.id).toBeDefined()
  })

  it('deve listar quartos disponíveis com cálculo de valor', async () => {
    const disponiveis = await disponibilidade_use_case.execute({
      hotel_id,
      check_in: '2026-12-01',
      check_out: '2026-12-03', // 2 noites x 250 = 500
      regime_alimentacao_id: regime.id,
      pessoas: 2,
    })

    expect(disponiveis).toHaveLength(2)
    expect(disponiveis[0].valor_total).toBe('500.00')
    expect(disponiveis[1].valor_total).toBe('500.00')
  })
})
