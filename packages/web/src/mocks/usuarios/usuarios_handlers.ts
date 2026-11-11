import type { Grupo, Usuario } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

function make_usuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: 'usuario-1',
    hotel_id: 'hotel-1',
    nome_completo: 'Maria Recepcionista',
    email: 'maria@hotelteste.com',
    nascimento: '1990-05-10T00:00:00.000Z',
    genero: 'Feminino',
    celular: '11999998888',
    cpf: '12345678901',
    rg: null,
    grupos_ids: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const usuarios: Usuario[] = [
  make_usuario(),
  make_usuario({
    id: 'usuario-2',
    nome_completo: 'Carlos Gerente',
    email: 'carlos@hotelteste.com',
    cpf: '10987654321',
    celular: '11988887777',
  }),
]

const grupos: Grupo[] = []

function meta(total: number) {
  return { pagina: 1, limite: 50, total, ultima_pagina: 1 }
}

// In-memory store lives for the page lifetime (reset on full reload), which is
// enough for create/edit flows that navigate client-side.
export const usuarios_handlers = [
  http.get(`${BASE_URL}/usuarios`, ({ request }) => {
    const busca = new URL(request.url).searchParams.get('busca')?.toLowerCase()
    const data = busca
      ? usuarios.filter(u => u.nome_completo.toLowerCase().includes(busca))
      : usuarios
    return HttpResponse.json({ data, meta: meta(data.length) })
  }),

  http.get(`${BASE_URL}/usuarios/:id`, ({ params }) => {
    const usuario = usuarios.find(u => u.id === params.id)
    if (!usuario) {
      return HttpResponse.json({ message: 'Não encontrado' }, { status: 404 })
    }
    return HttpResponse.json(usuario)
  }),

  http.post(`${BASE_URL}/usuarios`, async ({ request }) => {
    const body = (await request.json()) as Partial<Usuario>
    if (usuarios.some(u => u.email === body.email)) {
      return HttpResponse.json({ message: 'Conflito' }, { status: 409 })
    }
    const novo = make_usuario({
      ...body,
      id: `usuario-${usuarios.length + 1}`,
    })
    usuarios.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.put(`${BASE_URL}/usuarios/:id`, async ({ params, request }) => {
    const index = usuarios.findIndex(u => u.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Não encontrado' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Usuario>
    usuarios[index] = { ...usuarios[index], ...body }
    return HttpResponse.json(usuarios[index])
  }),

  http.get(`${BASE_URL}/grupos`, () =>
    HttpResponse.json({ data: grupos, meta: meta(grupos.length) })
  ),
]
