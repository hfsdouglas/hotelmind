import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { EditarGrupoPage } from './[id]/editar'

const BASE_URL = 'http://localhost:3000'

const mockGrupo = {
  id: 'grupo-1',
  grupo: 'Recepção e Atendimento',
  descricao: 'Acesso total aos quartos e reservas',
  status: 'S',
}

const mockRotas = [
  {
    id: 'rota-1',
    modulo: 'Recepção',
    recurso: 'Check-in',
    rota: '/checkin',
    icone: null,
    ordem: 1,
    ativo: true,
  },
]

describe('EditarGrupoPage', () => {
  it('loads and displays existing grupo data in form', async () => {
    server.use(
      http.get(`${BASE_URL}/grupos/grupo-1`, () =>
        HttpResponse.json(mockGrupo)
      ),
      http.get(`${BASE_URL}/grupos/grupo-1/rotas`, () =>
        HttpResponse.json(mockRotas)
      ),
      http.get(`${BASE_URL}/rotas`, () => HttpResponse.json(mockRotas))
    )

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/grupos/grupo-1/editar']}>
          <Routes>
            <Route path="/grupos/:id/editar" element={<EditarGrupoPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByDisplayValue('Recepção e Atendimento')
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Acesso total aos quartos e reservas')
    ).toBeInTheDocument()
  })
})
