import { http, HttpResponse } from 'msw'

export const mock_rotas = [
  {
    id: 'r1',
    modulo: 'hospedagem',
    recurso: 'reservas',
    rota: '/reservas',
    icone: 'Calendar',
    ordem: 1,
    ativo: true,
  },
  {
    id: 'r2',
    modulo: 'financeiro',
    recurso: 'caixa',
    rota: '/caixa',
    icone: null,
    ordem: 2,
    ativo: false,
  },
]

export const rotas_handlers = [
  http.get('http://localhost:3000/admin/rotas', () => {
    return HttpResponse.json({
      data: mock_rotas,
      meta: { pagina: 1, limite: 50, total: mock_rotas.length, ultima_pagina: 1 },
    })
  }),

  http.get('http://localhost:3000/admin/rotas/:id', ({ params }) => {
    const rota = mock_rotas.find(r => r.id === params.id)
    if (!rota) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(rota)
  }),

  http.post('http://localhost:3000/admin/rotas', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'new-id', ...(body as object) }, { status: 201 })
  }),

  http.put('http://localhost:3000/admin/rotas/:id', async ({ params, request }) => {
    const body = await request.json()
    const rota = mock_rotas.find(r => r.id === params.id)
    if (!rota) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...rota, ...(body as object) })
  }),

  http.delete('http://localhost:3000/admin/rotas/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
