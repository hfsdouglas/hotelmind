import { http, HttpResponse } from 'msw'

export const mock_administradores = [
  { id: 'a1', nome_completo: 'João Silva', email: 'joao@hotelmind.com', status: 'ativo' },
  { id: 'a2', nome_completo: 'Maria Santos', email: 'maria@hotelmind.com', status: 'inativo' },
]

export const administradores_handlers = [
  http.get('http://localhost:3000/admin/administradores', () => {
    return HttpResponse.json({
      data: mock_administradores,
      meta: {
        pagina: 1,
        limite: 50,
        total: mock_administradores.length,
        ultima_pagina: 1,
      },
    })
  }),

  http.get('http://localhost:3000/admin/administradores/:id', ({ params }) => {
    const admin = mock_administradores.find(a => a.id === params.id)
    if (!admin) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(admin)
  }),

  http.post('http://localhost:3000/admin/administradores', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'new-id', ...(body as object) }, { status: 201 })
  }),

  http.put('http://localhost:3000/admin/administradores/:id', async ({ params, request }) => {
    const body = await request.json()
    const admin = mock_administradores.find(a => a.id === params.id)
    if (!admin) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...admin, ...(body as object) })
  }),

  http.delete('http://localhost:3000/admin/administradores/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
