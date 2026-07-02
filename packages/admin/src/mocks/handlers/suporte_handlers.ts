import { http, HttpResponse } from 'msw'

export const mock_hoteis_suporte = [
  {
    id: 'hs1',
    nome_hotel: 'Furnaspark Resort',
    razao_social: 'Furnaspark Resort Ltda',
    nome_fantasia: 'Furnaspark Resort',
    cnpj: '11111111111111',
    email_comercial: 'ativo@furnaspark.com.br',
    telefone_comercial: '11999999999',
    website: null,
    status: 'S',
  },
  {
    id: 'hs2',
    nome_hotel: 'Praia Encantada',
    razao_social: 'Praia Encantada Ltda',
    nome_fantasia: 'Praia Encantada',
    cnpj: '22222222222222',
    email_comercial: 'inativo@praiaencantada.com.br',
    telefone_comercial: '21999999999',
    website: null,
    status: 'N',
  },
]

export const mock_usuarios_hotel = [
  { id: 'u1', nome_completo: 'Douglas Faria', email: 'douglas@furnaspark.com.br' },
  { id: 'u2', nome_completo: 'Ana Souza', email: 'ana@furnaspark.com.br' },
]

/** Filters `mock_hoteis_suporte` by the `status` query param, mirroring the real API. */
export const suporte_hoteis_handlers = [
  http.get('http://localhost:3000/admin/hoteis', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const data = status ? mock_hoteis_suporte.filter(h => h.status === status) : mock_hoteis_suporte
    return HttpResponse.json({
      data,
      meta: { pagina: 1, limite: 50, total: data.length, ultima_pagina: 1 },
    })
  }),
]

export const suporte_hoteis_empty_handler = http.get('http://localhost:3000/admin/hoteis', () =>
  HttpResponse.json({ data: [], meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 } }),
)

export const suporte_usuarios_handlers = [
  http.get('http://localhost:3000/admin/hoteis/:id/usuarios', ({ params }) => {
    if (params.id === 'hs-sem-usuarios') return HttpResponse.json([])
    return HttpResponse.json(mock_usuarios_hotel)
  }),
]
