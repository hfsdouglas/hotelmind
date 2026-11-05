import { beforeEach, describe, expect, it } from 'vitest'
import { ReservaValidationError } from '@/core/errors/reserva_errors'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { ConsultarDisponibilidadeUseCase } from './consultar_disponibilidade_use_case'
import { CriarReservaUseCase } from './criar_reserva_use_case'

describe('Parceiro Comercial na Reserva (US5)', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let quartos_repo: InMemoryQuartoRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let parceiros_repo: InMemoryParceiroComercialRepository
  let use_case: CriarReservaUseCase

  const hotel_id = 'hotel-parceiro-123'
  let quarto_id: string
  let regime_id: string

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    quartos_repo = new InMemoryQuartoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

    const disp = new ConsultarDisponibilidadeUseCase(
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
      parceiros_repo,
      undefined,
      disp
    )

    const q = await quartos_repo.create({
      hotel_id,
      categoria_id: 'cat-1',
      identificacao: '101',
      limite_hospedes: 2,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })
    quarto_id = q.id

    const r = await regimes_repo.create({
      hotel_id,
      titulo: 'Café',
      cor_pulseira: '#fff',
      ativo: true,
    })
    regime_id = r.id

    await tarifarios_repo.create({
      hotel_id,
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa',
      valor_diaria: '200.00',
      datas: ['2026-12-01', '2026-12-02'],
      ativo: true,
    })
  })

  it('permite criar reserva com parceiro comercial ativo', async () => {
    const parceiro = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'agencia_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'CVC Viagens LTDA',
      documento: '00000000000191',
      status: 'ativo',
    })

    const reserva = await use_case.execute({
      hotel_id,
      titular_nome: 'Cliente CVC',
      quarto_id,
      regime_alimentacao_id: regime_id,
      parceiro_comercial_id: parceiro.id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
      quantidade_adultos: 1,
    })

    expect(reserva.parceiro_comercial_id).toBe(parceiro.id)
  })

  it('permite criar reserva sem parceiro (campo opcional)', async () => {
    const reserva = await use_case.execute({
      hotel_id,
      titular_nome: 'Cliente Direto',
      quarto_id,
      regime_alimentacao_id: regime_id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
      quantidade_adultos: 1,
    })

    expect(reserva.parceiro_comercial_id).toBeNull()
  })

  it('rejeita criação com parceiro comercial inativo', async () => {
    const parceiroInativo = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'agencia_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Fechada LTDA',
      documento: '00000000000191',
      status: 'bloqueado',
    })

    await expect(
      use_case.execute({
        hotel_id,
        titular_nome: 'Cliente',
        quarto_id,
        regime_alimentacao_id: regime_id,
        parceiro_comercial_id: parceiroInativo.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
        quantidade_adultos: 1,
      })
    ).rejects.toThrow(ReservaValidationError)
  })
})
