import type { RegimeAlimentacao } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

export const REGIME_PENSAO_COMPLETA_ID = '00000000-0000-4000-8000-0000000000a1'

export const REGIME_MEIA_PENSAO_ID = '00000000-0000-4000-8000-0000000000a2'

const regimes: RegimeAlimentacao[] = [
  {
    id: REGIME_PENSAO_COMPLETA_ID,
    hotel_id: 'hotel-1',
    titulo: 'Pensão Completa',
    descricao: null,
    cor_pulseira: '#10B981',
    ativo: true,
    criado_em: '2026-01-01T00:00:00.000Z',
    atualizado_em: '2026-01-01T00:00:00.000Z',
  },
  {
    id: REGIME_MEIA_PENSAO_ID,
    hotel_id: 'hotel-1',
    titulo: 'Meia Pensão',
    descricao: null,
    cor_pulseira: '#F59E0B',
    ativo: true,
    criado_em: '2026-01-01T00:00:00.000Z',
    atualizado_em: '2026-01-01T00:00:00.000Z',
  },
]

export const regimes_alimentacao_handlers = [
  http.get(`${BASE_URL}/regimes_alimentacao`, () =>
    HttpResponse.json({
      data: regimes,
      meta: { pagina: 1, limite: 50, total: regimes.length, ultima_pagina: 1 },
    })
  ),
]
