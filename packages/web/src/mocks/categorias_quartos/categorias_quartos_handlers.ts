import type { CategoriaQuarto } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

export function make_categoria_quarto(
  overrides: Partial<CategoriaQuarto> = {}
): CategoriaQuarto {
  return {
    id: 'categoria-1',
    hotel_id: 'hotel-1',
    nome: 'Suíte Luxo',
    status: 'S',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export const categorias_quartos_handlers = [
  http.get(`${BASE_URL}/categorias_quartos`, () => {
    const data = [make_categoria_quarto()]
    return HttpResponse.json({
      data,
      meta: { pagina: 1, limite: 250, total: data.length, ultima_pagina: 1 },
    })
  }),
]
