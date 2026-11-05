import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gruposService } from '@/api/grupos.service'
import { usuariosService } from '@/api/usuarios.service'
import { EditarUsuarioPage } from './[id]/editar'
import { NovoUsuarioPage } from './novo'

vi.mock('@/api/usuarios.service', () => ({
  usuariosService: {
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/api/grupos.service', () => ({
  gruposService: {
    list: vi.fn(),
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

const mockGrupos = {
  data: [
    { id: 'g-1', grupo: 'Atendimento' },
    { id: 'g-2', grupo: 'Gerência' },
  ],
  meta: { total: 2, pagina: 1, limite: 250, ultima_pagina: 1 },
}

describe('Usuarios Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(gruposService.list).mockResolvedValue(mockGrupos)
  })

  it('renders and submits NovoUsuarioPage with valid data', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(usuariosService.create).mockResolvedValue({
      id: 'u-new',
      nome_completo: 'Felipe Souza',
      email: 'felipe@hotel.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/usuarios/novo']}>
          <NovoUsuarioPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Novo usuário' })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome completo *'), 'Felipe Souza')
    await user.type(screen.getByLabelText('E-mail *'), 'felipe@hotel.com')
    await user.type(screen.getByLabelText('Senha *'), 'password123')
    await user.type(screen.getByLabelText('Data de nascimento *'), '1995-05-10')
    await user.type(screen.getByLabelText('Gênero *'), 'M')
    await user.type(screen.getByLabelText('Celular *'), '11987654321')
    await user.type(screen.getByLabelText('CPF *'), '12345678901')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(usuariosService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_completo: 'Felipe Souza',
          email: 'felipe@hotel.com',
        })
      )
    })
  })

  it('loads existing user and updates fields on EditarUsuarioPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(usuariosService.get).mockResolvedValue({
      id: 'u-1',
      nome_completo: 'Ana Oliveira',
      email: 'ana@hotel.com',
      nascimento: '1992-03-15',
      genero: 'F',
      celular: '11988887777',
      cpf: '98765432100',
      rg: '1234567',
      grupos_ids: 'g-1',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(usuariosService.update).mockResolvedValue({
      id: 'u-1',
      nome_completo: 'Ana Oliveira Atualizada',
      email: 'ana@hotel.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/usuarios/u-1/editar']}>
          <Routes>
            <Route
              path="/usuarios/:id/editar"
              element={<EditarUsuarioPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByDisplayValue('Ana Oliveira')).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Nome completo')
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Oliveira Atualizada')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(usuariosService.update).toHaveBeenCalledWith(
        'u-1',
        expect.objectContaining({
          nome_completo: 'Ana Oliveira Atualizada',
        })
      )
    })
  })
})
