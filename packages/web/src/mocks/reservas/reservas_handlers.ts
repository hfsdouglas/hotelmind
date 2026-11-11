import type { Reserva } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

const reservas: Reserva[] = [
  {
    id: 'reserva-1',
    hotel_id: 'hotel-1',
    codigo: 'RES-0001',
    titular_nome: 'Renata Vasconcellos',
    titular_telefone: '11999998888',
    titular_email: 'renata@example.com',
    quarto_id: 'quarto-1',
    regime_alimentacao_id: 'regime-1',
    parceiro_id: null,
    check_in: '2026-12-20',
    check_out: '2026-12-22',
    quantidade_adultos: 2,
    quantidade_criancas: 0,
    valor_total: '1000.00',
    detalhamento_diarias: [],
    status: 'confirmada',
    token_fnrh: 'fnrh-valido',
    token_fnrh_ativo: true,
    fnrh_enviada_em: null,
    fichas_preenchidas: 1,
    total_hospedes: 2,
    observacoes: null,
    quarto: {
      id: 'quarto-1',
      identificacao: '101',
      categoria_nome: 'Suíte Luxo',
    },
    regime_alimentacao: {
      id: 'regime-1',
      titulo: 'Pensão Completa',
      cor_pulseira: '#10B981',
    },
    criado_em: '2026-11-01T12:00:00.000Z',
    atualizado_em: '2026-11-01T12:00:00.000Z',
  },
]

export const reservas_handlers = [
  http.get(`${BASE_URL}/reservas`, () =>
    HttpResponse.json({
      data: reservas,
      meta: { pagina: 1, limite: 50, total: reservas.length, ultima_pagina: 1 },
    })
  ),
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
