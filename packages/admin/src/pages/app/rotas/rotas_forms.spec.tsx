import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { rotasService } from '@/api/rotas.service'
import { RotaNovaPage } from './nova'
import { RotaEditarPage } from './editar'

vi.mock('@/api/rotas.service', () => ({
  rotasService: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

describe('Rotas Forms Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits RotaNovaPage with valid data', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(rotasService.create).mockResolvedValue({
      id: 'rota-new',
      modulo: 'Financeiro',
      recurso: 'Relatórios',
      rota: '/relatorios',
      icone: 'bar-chart',
      ordem: 1,
      ativo: true,
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/rotas/nova']}>
          <RotaNovaPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Nova Rota' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Módulo'), 'Financeiro')
    await user.type(screen.getByLabelText('Recurso'), 'Relatórios')
    await user.type(screen.getByLabelText('Rota'), '/relatorios')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(rotasService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          modulo: 'Financeiro',
          recurso: 'Relatórios',
          rota: '/relatorios',
        }),
      )
    })
  })

  it('loads and updates rota on RotaEditarPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(rotasService.findById).mockResolvedValue({
      id: 'r-1',
      modulo: 'Cadastros',
      recurso: 'Quartos',
      rota: '/quartos',
      icone: 'bed',
      ordem: 2,
      ativo: true,
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(rotasService.update).mockResolvedValue({
      id: 'r-1',
      modulo: 'Cadastros',
      recurso: 'Acomodações',
      rota: '/quartos',
      icone: 'bed',
      ordem: 2,
      ativo: true,
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/rotas/r-1/editar']}>
          <Routes>
            <Route path="/rotas/:id/editar" element={<RotaEditarPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByDisplayValue('Quartos')).toBeInTheDocument()

    const recursoInput = screen.getByLabelText('Recurso')
    await user.clear(recursoInput)
    await user.type(recursoInput, 'Acomodações')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(rotasService.update).toHaveBeenCalledWith(
        'r-1',
        expect.objectContaining({
          recurso: 'Acomodações',
        }),
      )
    })
  })
})
