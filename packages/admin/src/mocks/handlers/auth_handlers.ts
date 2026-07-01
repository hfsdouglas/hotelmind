import { http, HttpResponse } from 'msw'

export const auth_handlers = [
  http.post('http://localhost:3000/admin/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === 'admin@hotelmind.com.br' && body.password === 'senha1234') {
      return HttpResponse.json({
        admin: { id: '1', nome_completo: 'Admin Teste', email: body.email },
        message: 'Login realizado com sucesso.',
      })
    }

    return HttpResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 })
  }),

  http.post('http://localhost:3000/admin/auth/logout', () => {
    return HttpResponse.json({ message: 'Sessão encerrada.' })
  }),

  http.get('http://localhost:3000/admin/auth/me', () => {
    return HttpResponse.json({
      admin: { id: '1', nome_completo: 'Admin Teste', email: 'admin@hotelmind.com.br' },
    })
  }),
]
