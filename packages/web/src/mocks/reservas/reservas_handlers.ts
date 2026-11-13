import type { Hospede, QuartoDisponivel, Reserva } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'
import { QUARTO_101_ID, QUARTO_102_ID } from '../quartos/quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '../regimes_alimentacao/regimes_alimentacao_handlers'

const BASE_URL = 'http://localhost:3000'

const QUARTO_LUXO = { categoria_nome: 'Suíte Luxo' }

function make_hospede(
  posicao: number,
  nome: string | null,
  ficha_status: Hospede['ficha_status']
): Hospede {
  return {
    id: `hospede-${posicao}-${nome ?? 'sem-nome'}`,
    posicao,
    ficha_status,
    preenchido_por: ficha_status === 'preenchida' ? 'hotel' : null,
    preenchido_em: null,
    nome_completo: nome,
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
  }
}

function contar_fichas(hospedes: Hospede[]) {
  return {
    fichas_preenchidas: hospedes.filter(h => h.ficha_status === 'preenchida')
      .length,
    total_hospedes: hospedes.length,
  }
}

const REGIME_PENSAO = {
  id: REGIME_PENSAO_COMPLETA_ID,
  titulo: 'Pensão Completa',
  cor_pulseira: '#10B981',
}

function criar_fixtures_reservas(): Reserva[] {
  const base = {
    hotel_id: 'hotel-1',
    titular_telefone: '11999998888',
    titular_email: 'renata@example.com',
    regime_alimentacao_id: REGIME_PENSAO_COMPLETA_ID,
    parceiro_id: null,
    quantidade_criancas: 0,
    detalhamento_diarias: [],
    token_fnrh_ativo: true,
    fnrh_enviada_em: null,
    regime_alimentacao: REGIME_PENSAO,
    criado_em: '2026-11-01T12:00:00.000Z',
    atualizado_em: '2026-11-01T12:00:00.000Z',
  }
  const hospedes_101 = [
    make_hospede(1, 'Ana Souza', 'preenchida'),
    make_hospede(2, 'Bruno Souza', 'preenchida'),
  ]
  const hospedes_102 = [
    make_hospede(1, null, 'pendente'),
    make_hospede(2, 'Carlos Lima', 'rascunho'),
  ]
  const hospedes_103 = [make_hospede(1, null, 'pendente')]
  const hospedes_104 = [make_hospede(1, 'Diana Reis', 'preenchida')]

  return [
    {
      ...base,
      id: 'reserva-1',
      codigo: 'RES-0001',
      titular_nome: 'Renata Vasconcellos',
      quarto_id: QUARTO_101_ID,
      check_in: '2026-12-20',
      check_out: '2026-12-22',
      quantidade_adultos: 2,
      valor_total: '1000.00',
      status: 'confirmada',
      token_fnrh: 'fnrh-valido',
      fichas_preenchidas: 1,
      total_hospedes: 2,
      observacoes: null,
      quarto: { id: QUARTO_101_ID, identificacao: '101', ...QUARTO_LUXO },
    },
    {
      ...base,
      id: 'reserva-101',
      codigo: 'RES-0101',
      titular_nome: 'Ana Souza',
      quarto_id: QUARTO_101_ID,
      check_in: '2026-12-02',
      check_out: '2026-12-04',
      quantidade_adultos: 2,
      valor_total: '1500.00',
      status: 'confirmada',
      token_fnrh: 'fnrh-101',
      observacoes: 'Chegada tardia',
      quarto: { id: QUARTO_101_ID, identificacao: '101', ...QUARTO_LUXO },
      hospedes: hospedes_101,
      ...contar_fichas(hospedes_101),
    },
    {
      ...base,
      id: 'reserva-102',
      codigo: 'RES-0102',
      titular_nome: 'Fernanda Alves',
      quarto_id: QUARTO_102_ID,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 2,
      quantidade_criancas: 1,
      valor_total: '980.50',
      status: 'confirmada',
      token_fnrh: 'fnrh-102',
      observacoes: null,
      parceiro_id: 'parceiro-1',
      parceiro: { id: 'parceiro-1', razao_social: 'Agência Sol' },
      quarto: { id: QUARTO_102_ID, identificacao: '102', ...QUARTO_LUXO },
      hospedes: hospedes_102,
      ...contar_fichas(hospedes_102),
    },
    {
      ...base,
      id: 'reserva-103',
      codigo: 'RES-0103',
      titular_nome: 'Eduarda Prado',
      quarto_id: QUARTO_101_ID,
      check_in: '2026-12-06',
      check_out: '2026-12-08',
      quantidade_adultos: 1,
      valor_total: '700.00',
      status: 'a_confirmar',
      token_fnrh: 'fnrh-103',
      observacoes: null,
      quarto: { id: QUARTO_101_ID, identificacao: '101', ...QUARTO_LUXO },
      hospedes: hospedes_103,
      ...contar_fichas(hospedes_103),
    },
    {
      ...base,
      id: 'reserva-104',
      codigo: 'RES-0104',
      titular_nome: 'Diana Reis',
      quarto_id: QUARTO_102_ID,
      check_in: '2026-12-05',
      check_out: '2026-12-07',
      quantidade_adultos: 1,
      valor_total: '600.00',
      status: 'check_in',
      token_fnrh: 'fnrh-104',
      observacoes: null,
      quarto: { id: QUARTO_102_ID, identificacao: '102', ...QUARTO_LUXO },
      hospedes: hospedes_104,
      ...contar_fichas(hospedes_104),
    },
  ]
}

let reservas: Reserva[] = criar_fixtures_reservas()
let ultimo_corpo: unknown = null

export function reset_reservas_fixtures() {
  reservas = criar_fixtures_reservas()
  ultimo_corpo = null
}

export function ultimo_corpo_alterar_status(): unknown {
  return ultimo_corpo
}

const disponibilidade: QuartoDisponivel[] = [
  {
    quarto_id: QUARTO_101_ID,
    identificacao: '101',
    categoria_id: 'categoria-1',
    categoria_nome: 'Suíte Luxo',
    limite_hospedes: 2,
    valor_total: '900.00',
  },
  {
    quarto_id: QUARTO_102_ID,
    identificacao: '102',
    categoria_id: 'categoria-1',
    categoria_nome: 'Suíte Luxo',
    limite_hospedes: 3,
    valor_total: '900.00',
  },
]

export const reservas_handlers = [
  http.get(`${BASE_URL}/reservas`, () =>
    HttpResponse.json({
      data: reservas,
      meta: { pagina: 1, limite: 50, total: reservas.length, ultima_pagina: 1 },
    })
  ),
  // Must be declared before any `/reservas/:id` route
  http.get(`${BASE_URL}/reservas/disponibilidade`, () =>
    HttpResponse.json(disponibilidade)
  ),
  http.get(`${BASE_URL}/reservas/:id`, ({ params }) => {
    const reserva = reservas.find(r => r.id === params.id)
    if (!reserva) {
      return HttpResponse.json(
        { message: 'Reserva não encontrada.' },
        { status: 404 }
      )
    }
    return HttpResponse.json(reserva)
  }),
  http.patch(`${BASE_URL}/reservas/:id/status`, async ({ params, request }) => {
    const body = (await request.json()) as { status: Reserva['status'] }
    ultimo_corpo = body
    const reserva = reservas.find(r => r.id === params.id)
    if (!reserva) {
      return HttpResponse.json(
        { message: 'Reserva não encontrada.' },
        { status: 404 }
      )
    }
    if (reserva.status === 'a_confirmar' && body.status === 'check_in') {
      return HttpResponse.json(
        { message: 'Transição de status inválida: a_confirmar → check_in' },
        { status: 422 }
      )
    }
    reserva.status = body.status
    return HttpResponse.json(reserva)
  }),
  http.put(`${BASE_URL}/reservas/:id/hospedes/:posicao`, ({ params }) => {
    const reserva = reservas.find(r => r.id === params.id)
    const hospede = reserva?.hospedes?.find(
      h => h.posicao === Number(params.posicao)
    )
    if (!hospede) {
      return HttpResponse.json(
        { message: 'Hóspede não encontrado.' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ ...hospede, ficha_status: 'preenchida' })
  }),
  http.post(`${BASE_URL}/reservas`, async ({ request }) => {
    const body = (await request.json()) as Partial<Reserva>
    const nova: Reserva = {
      ...reservas[0],
      id: 'reserva-nova',
      codigo: 'RES-0002',
      status: 'a_confirmar',
      check_in: body.check_in ?? '',
      check_out: body.check_out ?? '',
      quarto_id: body.quarto_id ?? '',
      titular_nome: body.titular_nome ?? '',
    }
    return HttpResponse.json(nova, { status: 201 })
  }),
  http.get(`${BASE_URL}/comercial/parceiros`, () =>
    HttpResponse.json({
      data: [],
      meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 },
    })
  ),
  http.post(`${BASE_URL}/reservas/:id/link-fnrh/regenerar`, () =>
    HttpResponse.json({ url_token: 'novo-token', ativo: true })
  ),
  http.post(`${BASE_URL}/reservas/:id/link-fnrh/desativar`, () =>
    HttpResponse.json({ url_token: 'token-atual', ativo: false })
  ),
]
