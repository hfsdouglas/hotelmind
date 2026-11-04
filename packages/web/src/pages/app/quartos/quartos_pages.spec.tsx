import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { quartosService } from '@/api/quartos.service'
import { NovoQuartoPage } from './novo'
import { EditarQuartoPage } from './[id]/editar'

vi.mock('@/api/categorias_quartos.service', () => ({
  categoriasQuartosService: {
    list: vi.fn(),
  },
}))

vi.mock('@/api/quartos.service', () => ({
  quartosService: {
    create: vi.fn(),
    get: vi.fn(),
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

const mockCategories = {
  data: [
    { id: 'cat-1', nome: 'Standard', status: 'S' as const },
    { id: 'cat-2', nome: 'Luxo', status: 'S' as const },
  ],
  meta: { total: 2, pagina: 1, limite: 250, ultima_pagina: 1 },
}

describe('Quartos Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoriasQuartosService.list).mockResolvedValue(mockCategories)
  })

  it('renders and submits NovoQuartoPage with valid fields', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(quartosService.create).mockResolvedValue({
      id: 'q-new',
      hotel_id: 'h-1',
      categoria_id: 'cat-1',
      identificacao: '202',
      descricao: 'Quarto andar alto',
      limite_hospedes: 2,
      status: 'S',
      camas: [{ tipo: 'casal', quantidade: 1 }],
      categoria: { id: 'cat-1', nome: 'Standard', status: 'S' },
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/quartos/novo']}>
          <NovoQuartoPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'Novo quarto' })).toBeInTheDocument()

    // Fill form
    const idInput = screen.getByLabelText('Identificação *')
    await user.type(idInput, '202')

    const limitInput = screen.getByLabelText('Limite de hóspedes *')
    await user.type(limitInput, '2')

    const descInput = screen.getByLabelText('Descrição')
    await user.type(descInput, 'Quarto andar alto')

    // Select category
    const catTrigger = screen.getByRole('combobox', { name: /categoria/i })
    const hiddenSelect = catTrigger.parentElement?.querySelector('select')
    if (hiddenSelect) {
      fireEvent.change(hiddenSelect, { target: { value: 'cat-1' } })
    }

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(quartosService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          categoria_id: 'cat-1',
          identificacao: '202',
          limite_hospedes: 2,
        }),
      )
    })
  })

  it('loads existing quarto and updates it on EditarQuartoPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(quartosService.get).mockResolvedValue({
      id: 'q-101',
      hotel_id: 'h-1',
      categoria_id: 'cat-1',
      identificacao: '101',
      descricao: 'Quarto térreo',
      limite_hospedes: 3,
      status: 'S',
      camas: [{ tipo: 'casal', quantidade: 1 }],
      categoria: { id: 'cat-1', nome: 'Standard', status: 'S' },
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(quartosService.update).mockResolvedValue({
      id: 'q-101',
      hotel_id: 'h-1',
      categoria_id: 'cat-1',
      identificacao: '101',
      descricao: 'Quarto reformado',
      limite_hospedes: 3,
      status: 'S',
      camas: [{ tipo: 'casal', quantidade: 1 }],
      categoria: { id: 'cat-1', nome: 'Standard', status: 'S' },
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/quartos/q-101/editar']}>
          <Routes>
            <Route path="/quartos/:id/editar" element={<EditarQuartoPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByDisplayValue('101')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Quarto térreo')).toBeInTheDocument()

    const descInput = screen.getByLabelText('Descrição')
    await user.clear(descInput)
    await user.type(descInput, 'Quarto reformado')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(quartosService.update).toHaveBeenCalledWith(
        'q-101',
        expect.objectContaining({
          descricao: 'Quarto reformado',
        }),
      )
    })
  })
})
