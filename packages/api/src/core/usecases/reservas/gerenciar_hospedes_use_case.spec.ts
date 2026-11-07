import { beforeEach, describe, expect, it } from 'vitest'
import {
  ReservaTransicaoInvalidaError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { AlterarStatusReservaUseCase } from './alterar_status_reserva_use_case'
import { ConsultarDisponibilidadeUseCase } from './consultar_disponibilidade_use_case'
import { EditarReservaUseCase } from './editar_reserva_use_case'
import { SalvarFichaHospedeUseCase } from './salvar_ficha_hospede_use_case'

describe('Gerenciar Hospedes, Status e Edição da Reserva', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let quartos_repo: InMemoryQuartoRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let salvar_ficha_use_case: SalvarFichaHospedeUseCase
  let alterar_status_use_case: AlterarStatusReservaUseCase
  let editar_reserva_use_case: EditarReservaUseCase

  const hotel_id = 'hotel-gestao-123'
  let reserva_id: string
  let quarto_id: string
  let regime_id: string

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    quartos_repo = new InMemoryQuartoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()

    const disp = new ConsultarDisponibilidadeUseCase(
      reservas_repo,
      quartos_repo,
      tarifarios_repo
    )

    salvar_ficha_use_case = new SalvarFichaHospedeUseCase(
      reservas_repo,
      hospedes_repo
    )
    alterar_status_use_case = new AlterarStatusReservaUseCase(reservas_repo)
    editar_reserva_use_case = new EditarReservaUseCase(
      reservas_repo,
      hospedes_repo,
      quartos_repo,
      regimes_repo,
      tarifarios_repo,
      undefined,
      undefined,
      undefined,
      disp
    )

    const q = await quartos_repo.create({
      hotel_id,
      categoria_id: 'cat-1',
      identificacao: '101',
      limite_hospedes: 4,
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
      datas: ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04'],
      ativo: true,
    })

    const criada = await reservas_repo.create({
      hotel_id,
      codigo: 'RES-000001',
      titular_nome: 'Marcos',
      quarto_id,
      regime_alimentacao_id: regime_id,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 2,
      valor_total: '400.00',
      detalhamento_diarias: [],
      token_fnrh: 'token-abc',
      status: 'a_confirmar',
    })
    reserva_id = criada.id

    await hospedes_repo.create_many([
      { reserva_id, posicao: 1, ficha_status: 'pendente' },
      { reserva_id, posicao: 2, ficha_status: 'pendente' },
    ])
  })

  it('equipe pode salvar rascunho de ficha e preenchimento completo', async () => {
    // 1. Rascunho
    const rascunho = await salvar_ficha_use_case.execute({
      reserva_id,
      hotel_id,
      posicao: 1,
      dados: {
        nome_completo: 'Marcos Braz',
      },
    })
    expect(rascunho.ficha_status).toBe('rascunho')
    expect(rascunho.preenchido_por).toBe('hotel')

    // 2. Preenchida completa com dados obrigatórios
    const preenchida = await salvar_ficha_use_case.execute({
      reserva_id,
      hotel_id,
      posicao: 1,
      dados: {
        concluir: true,
        nome_completo: 'Marcos Braz',
        nacionalidade: 'Brasileira',
        data_nascimento: '1985-05-20',
        sexo: 'Masculino',
        profissao: 'Engenheiro',
        tipo_documento: 'rg',
        numero_documento: '12345678',
        logradouro: 'Av Paulista',
        cidade: 'São Paulo',
        estado: 'SP',
        telefone: '11999998888',
        motivo_viagem: 'Lazer',
        meio_transporte: 'Avião',
      },
    })
    expect(preenchida.ficha_status).toBe('preenchida')
  })

  it('permite transições de status válidas e rejeita inválidas', async () => {
    // a_confirmar -> confirmada (válida)
    const c1 = await alterar_status_use_case.execute({
      reserva_id,
      hotel_id,
      status_novo: 'confirmada',
    })
    expect(c1.status).toBe('confirmada')

    // confirmada -> check_out (inválida, precisa passar por check_in)
    await expect(
      alterar_status_use_case.execute({
        reserva_id,
        hotel_id,
        status_novo: 'check_out',
      })
    ).rejects.toThrow(ReservaTransicaoInvalidaError)

    // confirmada -> check_in (válida)
    const c2 = await alterar_status_use_case.execute({
      reserva_id,
      hotel_id,
      status_novo: 'check_in',
    })
    expect(c2.status).toBe('check_in')

    // check_in -> check_out (válida)
    const c3 = await alterar_status_use_case.execute({
      reserva_id,
      hotel_id,
      status_novo: 'check_out',
    })
    expect(c3.status).toBe('check_out')

    // check_out é final -> não pode mudar para cancelada
    await expect(
      alterar_status_use_case.execute({
        reserva_id,
        hotel_id,
        status_novo: 'cancelada',
      })
    ).rejects.toThrow(ReservaTransicaoInvalidaError)
  })

  it('ao reduzir quantidade de pessoas, impede remoção de posições com ficha preenchida', async () => {
    // Preencher a ficha da posição 2
    await hospedes_repo.update_ficha(reserva_id, 2, {
      ficha_status: 'preenchida',
      nome_completo: 'Hóspede Dois',
    })

    // Tentar reduzir para 1 pessoa (tentará remover posição 2)
    await expect(
      editar_reserva_use_case.execute({
        reserva_id,
        hotel_id,
        dados: {
          quantidade_adultos: 1,
          quantidade_criancas: 0,
        },
      })
    ).rejects.toThrow(ReservaValidationError)
  })
})
