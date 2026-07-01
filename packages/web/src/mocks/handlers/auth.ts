import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:3000'

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: {
          id: 'user-1',
          nome_completo: 'Test User',
          email: 'test@example.com',
          hotel_id: 'hotel-1',
          grupos_ids: null,
        },
        hotel: {
          id: 'hotel-1',
          nome_hotel: 'Hotel Teste',
          nome_fantasia: 'Hotel Teste',
          cnpj: '00.000.000/0001-00',
        },
        message: 'Login realizado com sucesso',
        rotas: [],
      })
    }

    return HttpResponse.json(
      { message: 'Credenciais inválidas' },
      { status: 401 },
    )
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Sessão encerrada' })
  }),

  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        nome_completo: 'Test User',
        email: 'test@example.com',
        hotel_id: 'hotel-1',
        grupos_ids: null,
      },
      hotel: {
        id: 'hotel-1',
        nome_hotel: 'Hotel Teste',
        nome_fantasia: 'Hotel Teste',
        cnpj: '00.000.000/0001-00',
      },
      rotas: [],
    })
  }),
]
