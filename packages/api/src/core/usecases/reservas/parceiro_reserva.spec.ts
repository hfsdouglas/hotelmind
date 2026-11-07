import { beforeEach, describe, expect, it } from 'vitest'
import { ReservaValidationError } from '@/core/errors/reserva_errors'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
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
import { EditarReservaUseCase } from './editar_reserva_use_case'

describe('Parceiro Comercial na Reserva (US3)', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let quartos_repo: InMemoryQuartoRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let parceiros_repo: InMemoryParceiroComercialRepository
  let disponibilidade_use_case: ConsultarDisponibilidadeUseCase
  let use_case: CriarReservaUseCase
  let editar_use_case: EditarReservaUseCase

  const hotel_id = 'hotel-parceiro-123'
  let quarto_id: string
  let quarto2_id: string
  let regime_id: string

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    quartos_repo = new InMemoryQuartoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

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
      parceiros_repo,
      undefined,
      disponibilidade_use_case
    )

    editar_use_case = new EditarReservaUseCase(
      reservas_repo,
      hospedes_repo,
      quartos_repo,
      regimes_repo,
      tarifarios_repo,
      parceiros_repo,
      undefined,
      undefined,
      disponibilidade_use_case
    )

    const q = await quartos_repo.create({
      hotel_id,
      categoria_id: 'cat-1',
      identificacao: '101',
      limite_hospedes: 2,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })
    quarto_id = q.id

    const q2 = await quartos_repo.create({
      hotel_id,
      categoria_id: 'cat-2',
      identificacao: '201',
      limite_hospedes: 2,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })
    quarto2_id = q2.id

    const r = await regimes_repo.create({
      hotel_id,
      titulo: 'Café',
      cor_pulseira: '#fff',
      ativo: true,
    })
    regime_id = r.id

    // Tarifa pública geral para cat-1
    await tarifarios_repo.create({
      hotel_id,
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa Balcão Padrão',
      valor_diaria: '250.00',
      datas: ['2026-12-01'],
      ativo: true,
    })
  })

  it('permite criar reserva com parceiro comercial ativo e precificação exclusiva', async () => {
    const parceiro = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'CVC Viagens LTDA',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    // Cadastra tarifa com desconto acordado para a CVC na cat-1
    await tarifarios_repo.create({
      hotel_id,
      parceiro_id: parceiro.id,
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa Acordada CVC',
      valor_diaria: '180.00',
      datas: ['2026-12-01'],
      ativo: true,
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
    expect(reserva.valor_total).toBe('180.00')
    expect(reserva.detalhamento_diarias[0].tarifario_nome).toBe(
      'Tarifa Acordada CVC'
    )
  })

  it('restringe disponibilidade de suítes exibindo apenas as cobertas pelo parceiro', async () => {
    const parceiro = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'empresa_corporativa',
      tipo_pessoa: 'PJ',
      razao_social: 'Petrobras S.A.',
      documento: '33000167000101',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    // Parceiro só tem tarifa contratada para cat-2 (quarto2_id), não tem para cat-1
    await tarifarios_repo.create({
      hotel_id,
      parceiro_id: parceiro.id,
      categoria_quarto_id: 'cat-2',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa Petrobras Executivo',
      valor_diaria: '320.00',
      datas: ['2026-12-01'],
      ativo: true,
    })

    // Consulta disponibilidade informando parceiro
    const disponiveisComParceiro = await disponibilidade_use_case.execute({
      hotel_id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
      regime_alimentacao_id: regime_id,
      pessoas: 2,
      parceiro_id: parceiro.id,
    })

    // Apenas quarto2 (cat-2) deve aparecer, pois o parceiro não possui tarifa para cat-1
    expect(disponiveisComParceiro).toHaveLength(1)
    expect(disponiveisComParceiro[0].quarto_id).toBe(quarto2_id)
    expect(disponiveisComParceiro[0].valor_total).toBe('320.00')

    // Consulta disponibilidade sem parceiro (público)
    const disponiveisPublico = await disponibilidade_use_case.execute({
      hotel_id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
      regime_alimentacao_id: regime_id,
      pessoas: 2,
      parceiro_id: null,
    })

    // Sem parceiro, apenas cat-1 aparece (tarifa balcão), cat-2 é exclusiva da Petrobras
    expect(disponiveisPublico).toHaveLength(1)
    expect(disponiveisPublico[0].quarto_id).toBe(quarto_id)
    expect(disponiveisPublico[0].valor_total).toBe('250.00')
  })

  it('falha ao criar reserva com parceiro se categoria não tiver tarifa acordada', async () => {
    const parceiro = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'empresa_corporativa',
      tipo_pessoa: 'PJ',
      razao_social: 'Vale S.A.',
      documento: '33000167000101',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    // Tentar reservar quarto_id (cat-1) para o qual só existe tarifa pública, não da Vale
    await expect(
      use_case.execute({
        hotel_id,
        titular_nome: 'Funcionario Vale',
        quarto_id,
        regime_alimentacao_id: regime_id,
        parceiro_comercial_id: parceiro.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
        quantidade_adultos: 1,
      })
    ).rejects.toThrow(TarifarioSemCoberturaError)
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
    expect(reserva.valor_total).toBe('250.00')
  })

  it('rejeita criação com parceiro comercial inativo', async () => {
    const parceiroInativo = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Fechada LTDA',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
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

  it('recalcula tarifas ao alterar o parceiro em uma reserva existente', async () => {
    const parceiroA = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência A',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    const parceiroB = await parceiros_repo.create({
      hotel_id,
      tipo_parceiro: 'empresa_corporativa',
      tipo_pessoa: 'PJ',
      razao_social: 'Corporativo B',
      documento: '33000167000101',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    await tarifarios_repo.create({
      hotel_id,
      parceiro_id: parceiroA.id,
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa A',
      valor_diaria: '200.00',
      datas: ['2026-12-01'],
      ativo: true,
    })

    await tarifarios_repo.create({
      hotel_id,
      parceiro_id: parceiroB.id,
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: regime_id,
      nome: 'Tarifa B Especial',
      valor_diaria: '160.00',
      datas: ['2026-12-01'],
      ativo: true,
    })

    const reserva = await use_case.execute({
      hotel_id,
      titular_nome: 'Cliente Original',
      quarto_id,
      regime_alimentacao_id: regime_id,
      parceiro_comercial_id: parceiroA.id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
      quantidade_adultos: 1,
    })
    expect(reserva.valor_total).toBe('200.00')

    const atualizada = await editar_use_case.execute({
      reserva_id: reserva.id,
      hotel_id,
      dados: {
        parceiro_comercial_id: parceiroB.id,
      },
    })
    expect(atualizada.valor_total).toBe('160.00')
    expect(atualizada.detalhamento_diarias[0].tarifario_nome).toBe(
      'Tarifa B Especial'
    )
  })
})
