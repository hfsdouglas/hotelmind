import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { EditarCategoriaQuartoPage } from './[id]/editar'
import { NovaCategoriaQuartoPage } from './novo'

vi.mock('@/api/categorias_quartos.service', () => ({
  categoriasQuartosService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
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

describe('Categorias de Quartos Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new category on NovaCategoriaQuartoPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(categoriasQuartosService.create).mockResolvedValue({
      id: 'cat-new',
      nome: 'Luxo Premium',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/categorias_quartos/novo']}>
          <NovaCategoriaQuartoPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Nova categoria de quarto' })
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Nome *')
    await user.type(nameInput, 'Luxo Premium')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(categoriasQuartosService.create).toHaveBeenCalledWith({
        nome: 'Luxo Premium',
        status: 'S',
      })
    })
  })

  it('loads and updates an existing category on EditarCategoriaQuartoPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(categoriasQuartosService.get).mockResolvedValue({
      id: 'cat-1',
      nome: 'Standard',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })
    vi.mocked(categoriasQuartosService.update).mockResolvedValue({
      id: 'cat-1',
      nome: 'Standard Modificado',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/categorias_quartos/cat-1/editar']}>
          <Routes>
            <Route
              path="/categorias_quartos/:id/editar"
              element={<EditarCategoriaQuartoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByDisplayValue('Standard')).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Nome *')
    await user.clear(nameInput)
    await user.type(nameInput, 'Standard Modificado')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(categoriasQuartosService.update).toHaveBeenCalledWith('cat-1', {
        nome: 'Standard Modificado',
        status: 'S',
      })
    })
  })
})
