import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hoteisService } from '@/api/hoteis.service'
import { rotasService } from '@/api/rotas.service'
import { HotelEditarPage } from './editar'
import { HotelNovoPage } from './novo'
import { HotelRotasPage } from './rotas'

vi.mock('@/api/hoteis.service', () => ({
  hoteisService: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    getRotas: vi.fn(),
    setRotas: vi.fn(),
  },
}))

vi.mock('@/api/rotas.service', () => ({
  rotasService: {
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

describe('Hotéis Forms Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits HotelNovoPage with valid data', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    vi.mocked(hoteisService.create).mockResolvedValue({
      id: 'h-new',
      nome_hotel: 'Novo Hotel Plaza',
      razao_social: 'Novo Hotel Plaza LTDA',
      nome_fantasia: 'Novo Hotel',
      cnpj: '11222333000144',
      email_comercial: 'contato@novoplaza.com',
      telefone_comercial: '11987654321',
      website: 'https://novoplaza.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/hoteis/novo']}>
          <HotelNovoPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Novo Hotel' })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome do Hotel'), 'Novo Hotel Plaza')
    await user.type(
      screen.getByLabelText('Razão Social'),
      'Novo Hotel Plaza LTDA'
    )
    await user.type(screen.getByLabelText('Nome Fantasia'), 'Novo Hotel')
    await user.type(screen.getByLabelText('CNPJ'), '11222333000144')
    await user.type(
      screen.getByLabelText('E-mail Comercial'),
      'contato@novoplaza.com'
    )
    await user.type(screen.getByLabelText('Telefone Comercial'), '11987654321')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(hoteisService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_hotel: 'Novo Hotel Plaza',
          cnpj: '11222333000144',
        })
      )
    })
  })

  it('loads and updates hotel on HotelEditarPage', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(hoteisService.findById).mockResolvedValue({
      id: 'h-1',
      nome_hotel: 'Hotel Sol Nascente',
      razao_social: 'Sol Nascente LTDA',
      nome_fantasia: 'Sol Nascente',
      cnpj: '99888777000166',
      email_comercial: 'hotel@sol.com',
      telefone_comercial: '11977776666',
      website: 'https://sol.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(hoteisService.update).mockResolvedValue({
      id: 'h-1',
      nome_hotel: 'Hotel Sol Nascente Premium',
      razao_social: 'Sol Nascente LTDA',
      nome_fantasia: 'Sol Nascente',
      cnpj: '99888777000166',
      email_comercial: 'hotel@sol.com',
      telefone_comercial: '11977776666',
      website: 'https://sol.com',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/hoteis/h-1/editar']}>
          <Routes>
            <Route path="/hoteis/:id/editar" element={<HotelEditarPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByDisplayValue('Hotel Sol Nascente')
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Nome do Hotel')
    await user.clear(nameInput)
    await user.type(nameInput, 'Hotel Sol Nascente Premium')

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(hoteisService.update).toHaveBeenCalledWith(
        'h-1',
        expect.objectContaining({
          nome_hotel: 'Hotel Sol Nascente Premium',
        })
      )
    })
  })

  it('renders HotelRotasPage and saves route selection', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    vi.mocked(hoteisService.findById).mockResolvedValue({
      id: 'h-1',
      nome_hotel: 'Hotel Sol',
      razao_social: 'Sol LTDA',
      nome_fantasia: 'Sol',
      cnpj: '99888777000166',
      email_comercial: 'hotel@sol.com',
      telefone_comercial: '11977776666',
      website: '',
      status: 'S',
      criado_em: '2026-01-01',
      atualizado_em: '2026-01-01',
    })

    vi.mocked(rotasService.list).mockResolvedValue({
      data: [
        {
          id: 'r-1',
          modulo: 'Reservas',
          recurso: 'Check-in',
          rota: '/checkin',
          ordem: 1,
          ativo: true,
        },
      ],
      meta: { total: 1, pagina: 1, limite: 250, ultima_pagina: 1 },
    })

    vi.mocked(hoteisService.getRotas).mockResolvedValue([])
    vi.mocked(hoteisService.setRotas).mockResolvedValue({
      message: 'OK',
    } as never)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/hoteis/h-1/rotas']}>
          <Routes>
            <Route path="/hoteis/:id/rotas" element={<HotelRotasPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', { name: 'Rotas do Hotel' })
    ).toBeInTheDocument()
    expect(await screen.findByText('Sol')).toBeInTheDocument()
    expect(screen.getByText('Check-in')).toBeInTheDocument()

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(hoteisService.setRotas).toHaveBeenCalledWith('h-1', ['r-1'])
    })
  })
})
