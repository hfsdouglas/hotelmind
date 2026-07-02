import { http, HttpResponse } from 'msw'

export const mock_hoteis = [
  {
    id: 'h1',
    nome_hotel: 'Grand Palace',
    razao_social: 'Grand Palace Ltda',
    nome_fantasia: 'Grand Palace Hotel',
    cnpj: '12345678000100',
    email_comercial: 'contato@grandpalace.com',
    telefone_comercial: '11999999999',
    website: 'https://grandpalace.com',
    status: 'S',
  },
  {
    id: 'h2',
    nome_hotel: 'Mar Azul',
    razao_social: 'Mar Azul SA',
    nome_fantasia: 'Hotel Mar Azul',
    cnpj: '98765432000100',
    email_comercial: 'contato@marazul.com',
    telefone_comercial: '21999999999',
    website: null,
    status: 'S',
  },
]

export const hoteis_handlers = [
  http.get('http://localhost:3000/admin/hoteis', () => {
    return HttpResponse.json({
      data: mock_hoteis,
      meta: { pagina: 1, limite: 50, total: mock_hoteis.length, ultima_pagina: 1 },
    })
  }),

  http.get('http://localhost:3000/admin/hoteis/:id', ({ params }) => {
    const hotel = mock_hoteis.find(h => h.id === params.id)
    if (!hotel) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(hotel)
  }),

  http.post('http://localhost:3000/admin/hoteis', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'new-id', ...(body as object) }, { status: 201 })
  }),

  http.put('http://localhost:3000/admin/hoteis/:id', async ({ params, request }) => {
    const body = await request.json()
    const hotel = mock_hoteis.find(h => h.id === params.id)
    if (!hotel) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...hotel, ...(body as object) })
  }),

  http.delete('http://localhost:3000/admin/hoteis/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
