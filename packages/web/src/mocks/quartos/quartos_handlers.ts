import type { Quarto } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'
import { make_categoria_quarto } from '../categorias_quartos/categorias_quartos_handlers'

const BASE_URL = 'http://localhost:3000'

export const QUARTO_101_ID = '00000000-0000-4000-8000-000000000101'
export const QUARTO_102_ID = '00000000-0000-4000-8000-000000000102'

function make_quarto(overrides: Partial<Quarto> = {}): Quarto {
  const categoria = make_categoria_quarto()
  return {
    id: QUARTO_101_ID,
    hotel_id: 'hotel-1',
    categoria_id: categoria.id,
    identificacao: '101',
    descricao: null,
    limite_hospedes: 2,
    status: 'S',
    categoria: { id: categoria.id, nome: categoria.nome, status: 'S' },
    camas: [
      { id: 'cama-1', tipo: 'casal', quantidade: 1 },
      { id: 'cama-2', tipo: 'solteiro', quantidade: 1 },
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const quartos: Quarto[] = [
  make_quarto(),
  make_quarto({
    id: QUARTO_102_ID,
    identificacao: '102',
    limite_hospedes: 3,
    camas: [{ id: 'cama-3', tipo: 'casal', quantidade: 1 }],
  }),
]

export const quartos_handlers = [
  http.get(`${BASE_URL}/quartos`, () =>
    HttpResponse.json({
      data: quartos,
      meta: { pagina: 1, limite: 50, total: quartos.length, ultima_pagina: 1 },
    })
  ),

  http.post(`${BASE_URL}/quartos`, async ({ request }) => {
    const body = (await request.json()) as {
      categoria_id: string
      identificacao: string
      descricao?: string
      limite_hospedes: number
      camas: { tipo: Quarto['camas'][number]['tipo']; quantidade: number }[]
    }
    if (quartos.some(q => q.identificacao === body.identificacao)) {
      return HttpResponse.json({ message: 'Conflito' }, { status: 409 })
    }
    const novo = make_quarto({
      id: `quarto-${quartos.length + 1}`,
      categoria_id: body.categoria_id,
      identificacao: body.identificacao,
      limite_hospedes: body.limite_hospedes,
      camas: body.camas.map((c, i) => ({ id: `cama-n${i}`, ...c })),
    })
    quartos.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),
]
