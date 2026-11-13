import type { Tarifario } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'
import { make_categoria_quarto } from '../categorias_quartos/categorias_quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '../regimes_alimentacao/regimes_alimentacao_handlers'

const BASE_URL = 'http://localhost:3000'

// Only "Pensão Completa" is sold for the category of suites 101/102;
// "Meia Pensão" exists in the hotel but has no tarifario for that category.
export function make_tarifario(overrides: Partial<Tarifario> = {}): Tarifario {
  const categoria = make_categoria_quarto()
  const resumo_categoria = { id: categoria.id, nome: categoria.nome }
  return {
    id: 'tarifario-1',
    hotel_id: 'hotel-1',
    parceiro_id: null,
    categoria_quarto_id: categoria.id,
    categoria_quarto_ids: [categoria.id],
    regime_alimentacao_id: REGIME_PENSAO_COMPLETA_ID,
    nome: 'Tarifa Pensão Completa',
    datas: ['2026-12-01', '2026-12-02', '2026-12-03'],
    valor_diaria: '300.00',
    minimo_diarias: 1,
    ativo: true,
    parceiro: null,
    categoria_quarto: resumo_categoria,
    categorias: [resumo_categoria],
    regime_alimentacao: {
      id: REGIME_PENSAO_COMPLETA_ID,
      titulo: 'Pensão Completa',
      cor_pulseira: '#10B981',
    },
    criado_em: '2026-01-01T00:00:00.000Z',
    atualizado_em: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const tarifarios: Tarifario[] = [make_tarifario()]

export const tarifarios_handlers = [
  http.get(`${BASE_URL}/tarifarios`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const categorias = params.getAll('categoria_quarto_id')
    const somente_ativos = params.get('ativo') === 'true'
    const data = tarifarios.filter(
      t =>
        (categorias.length === 0 ||
          t.categoria_quarto_ids.some(id => categorias.includes(id))) &&
        (!somente_ativos || t.ativo)
    )
    return HttpResponse.json({
      data,
      meta: { pagina: 1, limite: 250, total: data.length, ultima_pagina: 1 },
    })
  }),
]
