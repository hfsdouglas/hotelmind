import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { NovoGrupoPage } from './novo'

const BASE_URL = 'http://localhost:3000'

const rotas = [
  { id: 'rota-1', modulo: 'Administração', recurso: 'Usuários', rota: '/usuarios', icone: null, ordem: 1, ativo: true },
  { id: 'rota-2', modulo: 'Administração', recurso: 'Grupos', rota: '/grupos', icone: null, ordem: 2, ativo: true },
]

function mockRotas() {
  server.use(
    http.get(`${BASE_URL}/rotas`, () => HttpResponse.json(rotas)),
  )
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <NovoGrupoPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome *'), 'Recepção')
}

describe('NovoGrupoPage', () => {
  it('renders the access routes list grouped by module on the creation form', async () => {
    mockRotas()
    renderPage()

    expect(await screen.findByText('Rotas de acesso')).toBeInTheDocument()
    expect(await screen.findByText('Administração')).toBeInTheDocument()
    expect(screen.getByText('Usuários')).toBeInTheDocument()
    expect(screen.getByText('Grupos')).toBeInTheDocument()
  })

  it('creates the group then syncs the selected routes on submit', async () => {
    mockRotas()
    let syncedIds: string[] | undefined

    server.use(
      http.post(`${BASE_URL}/grupos`, () =>
        HttpResponse.json({ id: 'grupo-1', grupo: 'Recepção', descricao: null, status: 'S' }),
      ),
      http.put(`${BASE_URL}/grupos/grupo-1/rotas`, async ({ request }) => {
        const body = await request.json() as { rota_ids: string[] }
        syncedIds = body.rota_ids
        return HttpResponse.json(rotas)
      }),
    )

    const user = userEvent.setup()
    renderPage()

    await fillRequiredFields(user)
    await user.click(await screen.findByText('Usuários'))
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(syncedIds).toEqual(['rota-1'])
    })
  })

  it('creates the group successfully when no routes are selected', async () => {
    mockRotas()
    let createCalled = false
    let syncCalled = false

    server.use(
      http.post(`${BASE_URL}/grupos`, () => {
        createCalled = true
        return HttpResponse.json({ id: 'grupo-2', grupo: 'Sem rotas', descricao: null, status: 'S' })
      }),
      http.put(`${BASE_URL}/grupos/grupo-2/rotas`, async ({ request }) => {
        const body = await request.json() as { rota_ids: string[] }
        syncCalled = true
        expect(body.rota_ids).toEqual([])
        return HttpResponse.json([])
      }),
    )

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Rotas de acesso')

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(createCalled).toBe(true)
      expect(syncCalled).toBe(true)
    })
  })
})
