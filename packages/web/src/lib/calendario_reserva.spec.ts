import type { Quarto, Reserva } from '@hotelmind/contracts'
import { describe, expect, it } from 'vitest'
import {
  derive_suite_status,
  filtrar_reservas_calendario,
  map_quarto_to_room,
  map_reserva_to_calendario,
} from './calendario_reserva'

function make_quarto(overrides: Partial<Quarto> = {}): Quarto {
  return {
    id: 'quarto-101',
    hotel_id: 'hotel-1',
    categoria_id: 'cat-1',
    identificacao: '101',
    descricao: null,
    limite_hospedes: 2,
    status: 'S',
    categoria: { id: 'cat-1', nome: 'Suíte Luxo', status: 'S' },
    camas: [{ id: 'cama-1', tipo: 'casal', quantidade: 1 }],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function make_reserva(overrides: Partial<Reserva> = {}): Reserva {
  return {
    id: 'reserva-1',
    hotel_id: 'hotel-1',
    codigo: 'RES-0102',
    titular_nome: 'Fernanda Alves',
    titular_telefone: '11999998888',
    titular_email: 'fernanda@example.com',
    quarto_id: 'quarto-101',
    regime_alimentacao_id: 'regime-1',
    parceiro_id: null,
    check_in: '2026-12-02',
    check_out: '2026-12-04',
    quantidade_adultos: 2,
    quantidade_criancas: 1,
    valor_total: '980.50',
    detalhamento_diarias: [],
    status: 'confirmada',
    token_fnrh: 'token',
    token_fnrh_ativo: true,
    fnrh_enviada_em: null,
    fichas_preenchidas: 1,
    total_hospedes: 2,
    observacoes: 'Chegada tardia',
    quarto: {
      id: 'quarto-101',
      identificacao: '101',
      categoria_nome: 'Suíte Luxo',
    },
    regime_alimentacao: {
      id: 'regime-1',
      titulo: 'Pensão',
      cor_pulseira: '#000',
    },
    parceiro: { id: 'p1', razao_social: 'Agência Sol' },
    criado_em: '2026-11-01T00:00:00.000Z',
    atualizado_em: '2026-11-01T00:00:00.000Z',
    ...overrides,
  }
}

function make_hospede(
  posicao: number,
  nome_completo: string | null,
  ficha_status: 'pendente' | 'rascunho' | 'preenchida' = 'pendente'
) {
  return {
    id: `h-${posicao}`,
    posicao,
    ficha_status,
    preenchido_por: null,
    preenchido_em: null,
    nome_completo,
    nacionalidade: null,
    data_nascimento: null,
    sexo: null,
    profissao: null,
    tipo_documento: null,
    numero_documento: null,
    logradouro: null,
    numero_endereco: null,
    complemento: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    pais_residencia: null,
    telefone: null,
    email: null,
    motivo_viagem: null,
    meio_transporte: null,
    responsavel_posicao: null,
  } as const
}

describe('map_reserva_to_calendario', () => {
  it('preenche todos os campos do view model', () => {
    const quarto = make_quarto()

    const result = map_reserva_to_calendario(make_reserva(), quarto)

    expect(result).toMatchObject({
      id: 'reserva-1',
      codigo: 'RES-0102',
      quartoId: 'quarto-101',
      quarto_identificacao: '101',
      categoria_nome: 'Suíte Luxo',
      camas: quarto.camas,
      checkIn: '2026-12-02T00:00:00',
      checkOut: '2026-12-04T00:00:00',
      diarias: 2,
      status: 'confirmada',
      status_label: 'Confirmada',
      titular: {
        nome: 'Fernanda Alves',
        email: 'fernanda@example.com',
        telefone: '11999998888',
      },
      adultos: 2,
      criancas: 1,
      regime_titulo: 'Pensão',
      parceiro_nome: 'Agência Sol',
      valor_total: 980.5,
      observacoes: 'Chegada tardia',
      hospedes: [],
      fichas_preenchidas: 1,
      total_hospedes: 2,
    })
  })

  it('normaliza datas ISO completas para meia-noite local', () => {
    const result = map_reserva_to_calendario(
      make_reserva({
        check_in: '2026-12-02T00:00:00.000Z',
        check_out: '2026-12-04T00:00:00.000Z',
      }),
      make_quarto()
    )

    expect(result.checkIn).toBe('2026-12-02T00:00:00')
    expect(result.checkOut).toBe('2026-12-04T00:00:00')
  })

  it('usa 0 quando o valor total não é numérico', () => {
    expect(
      map_reserva_to_calendario(
        make_reserva({ valor_total: 'abc' }),
        make_quarto()
      ).valor_total
    ).toBe(0)
  })

  it('converte observações vazias em null', () => {
    expect(
      map_reserva_to_calendario(
        make_reserva({ observacoes: '' }),
        make_quarto()
      ).observacoes
    ).toBeNull()
  })

  it('ordena hóspedes por posição e converte nome vazio em null', () => {
    const result = map_reserva_to_calendario(
      make_reserva({
        hospedes: [
          make_hospede(2, 'Carlos Lima', 'rascunho'),
          make_hospede(1, '', 'pendente'),
        ],
      }),
      make_quarto()
    )

    expect(result.hospedes).toEqual([
      { posicao: 1, nome: null, ficha_status: 'pendente' },
      { posicao: 2, nome: 'Carlos Lima', ficha_status: 'rascunho' },
    ])
  })

  it('usa o quarto da lista quando a reserva não traz o quarto embutido', () => {
    const result = map_reserva_to_calendario(
      make_reserva({ quarto: undefined }),
      make_quarto()
    )

    expect(result.quarto_identificacao).toBe('101')
    expect(result.categoria_nome).toBe('Suíte Luxo')
  })

  it('usa "-" quando não há quarto em lugar nenhum', () => {
    const result = map_reserva_to_calendario(
      make_reserva({ quarto: undefined }),
      undefined
    )

    expect(result.quarto_identificacao).toBe('-')
    expect(result.categoria_nome).toBe('-')
    expect(result.camas).toEqual([])
  })

  it('rotula check_in como "Check-in"', () => {
    expect(
      map_reserva_to_calendario(
        make_reserva({ status: 'check_in' }),
        make_quarto()
      ).status_label
    ).toBe('Check-in')
  })
})

describe('filtrar_reservas_calendario', () => {
  it('descarta canceladas, check_out e no_show', () => {
    const reservas = [
      make_reserva({ id: 'a', status: 'a_confirmar' }),
      make_reserva({ id: 'b', status: 'confirmada' }),
      make_reserva({ id: 'c', status: 'check_in' }),
      make_reserva({ id: 'd', status: 'cancelada' }),
      make_reserva({ id: 'e', status: 'check_out' }),
      make_reserva({ id: 'f', status: 'no_show' }),
    ]

    expect(filtrar_reservas_calendario(reservas).map(r => r.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })
})

describe('derive_suite_status', () => {
  const quarto = make_quarto()
  const calendario = (overrides: Partial<Reserva>) =>
    map_reserva_to_calendario(make_reserva(overrides), quarto)

  it('marca bloqueado quando o quarto está inativo, mesmo com check-in', () => {
    const inativo = make_quarto({ status: 'N' })

    expect(
      derive_suite_status(inativo, [calendario({ status: 'check_in' })])
    ).toBe('bloqueado')
  })

  it.each([
    ['no passado', '2026-11-01', '2026-11-03'],
    ['no futuro', '2027-01-10', '2027-01-12'],
  ])('marca checkin quando há reserva check_in da suíte %s', (_l, ci, co) => {
    expect(
      derive_suite_status(quarto, [
        calendario({ status: 'check_in', check_in: ci, check_out: co }),
      ])
    ).toBe('checkin')
  })

  it('marca disponivel quando só há reservas confirmadas', () => {
    expect(
      derive_suite_status(quarto, [calendario({ status: 'confirmada' })])
    ).toBe('disponivel')
  })

  it('ignora check_in de outra suíte (isolamento por suíte)', () => {
    expect(
      derive_suite_status(quarto, [
        calendario({ status: 'check_in', quarto_id: 'quarto-102' }),
      ])
    ).toBe('disponivel')
  })
})

describe('map_quarto_to_room', () => {
  it('usa a categoria e copia as camas', () => {
    const quarto = make_quarto()

    expect(map_quarto_to_room(quarto, [])).toMatchObject({
      id: 'quarto-101',
      numero: '101',
      tipo: 'Suíte Luxo',
      camas: quarto.camas,
      status: 'disponivel',
    })
  })

  it('usa "Padrão" sem categoria', () => {
    expect(
      map_quarto_to_room(make_quarto({ categoria: undefined }), []).tipo
    ).toBe('Padrão')
  })
})
