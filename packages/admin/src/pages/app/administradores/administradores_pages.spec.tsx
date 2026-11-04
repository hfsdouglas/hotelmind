import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { administradoresService } from '@/api/administradores.service'
import { AdministradorNovoPage } from './novo'
import { AdministradorEditarPage } from './editar'

vi.mock('@/api/administradores.service', () => ({
  administradoresService: {
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

describe('Administradores Pages (Novo e Editar)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits valid administrator creation on AdministradorNovoPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(administradoresService.create).mockResolvedValue({
      id: 'adm-new',
      nome_completo: 'Juliana Rocha',
      email: 'juliana@hotelmind.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/administradores/novo']}>
          <AdministradorNovoPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Novo Administrador' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome completo'), 'Juliana Rocha')
    await user.type(screen.getByLabelText('E-mail'), 'juliana@hotelmind.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(administradoresService.create).toHaveBeenCalledWith({
        nome_completo: 'Juliana Rocha',
        email: 'juliana@hotelmind.com',
        senha: 'password123',
        status: 'S',
      })
    })
  })

  it('loads and updates administrator on AdministradorEditarPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(administradoresService.findById).mockResolvedValue({
      id: 'adm-1',
      nome_completo: 'Juliana Rocha',
      email: 'juliana@hotelmind.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(administradoresService.update).mockResolvedValue({
      id: 'adm-1',
      nome_completo: 'Juliana Rocha Silva',
      email: 'juliana@hotelmind.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/administradores/adm-1/editar']}>
          <Routes>
            <Route path="/administradores/:id/editar" element={<AdministradorEditarPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByDisplayValue('Juliana Rocha')).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Nome completo')
    await user.clear(nameInput)
    await user.type(nameInput, 'Juliana Rocha Silva')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(administradoresService.update).toHaveBeenCalledWith(
        'adm-1',
        expect.objectContaining({
          nome_completo: 'Juliana Rocha Silva',
        }),
      )
    })
  })
})
