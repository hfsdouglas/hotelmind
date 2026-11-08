import type { Quarto, Reserva } from '@hotelmind/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { addDays, format } from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { quartosService } from '@/api/quartos.service'
import { reservasService } from '@/api/reservas.service'
import { Calendario } from './calendario'

vi.mock('@/api/quartos.service', () => ({
  quartosService: {
    list: vi.fn(),
  },
}))

vi.mock('@/api/reservas.service', () => ({
  reservasService: {
    list: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderCalendario() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <Calendario />
    </QueryClientProvider>
  )
}

describe('Página de Calendário de Reservas', () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const inTwoDaysStr = format(addDays(new Date(), 2), 'yyyy-MM-dd')
  const inThreeDaysStr = format(addDays(new Date(), 3), 'yyyy-MM-dd')
  const inFiveDaysStr = format(addDays(new Date(), 5), 'yyyy-MM-dd')

  const mockQuartosList: Quarto[] = [
    {
      id: 'quarto-1',
      hotel_id: 'hotel-1',
      categoria_id: 'cat-1',
      identificacao: '101',
      descricao: null,
      limite_hospedes: 2,
      status: 'S',
      categoria: { id: 'cat-1', nome: 'Standard', status: 'S' },
      camas: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quarto-2',
      hotel_id: 'hotel-1',
      categoria_id: 'cat-2',
      identificacao: '102',
      descricao: null,
      limite_hospedes: 4,
      status: 'S',
      categoria: { id: 'cat-2', nome: 'Deluxe', status: 'S' },
      camas: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quarto-3',
      hotel_id: 'hotel-1',
      categoria_id: 'cat-1',
      identificacao: '103',
      descricao: null,
      limite_hospedes: 2,
      status: 'N', // Inativo / Bloqueado
      categoria: { id: 'cat-1', nome: 'Standard', status: 'S' },
      camas: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const mockReservasList: Reserva[] = [
    {
      id: 'res-checkin',
      hotel_id: 'hotel-1',
      codigo: 'RES-001',
      titular_nome: 'João Silva',
      titular_telefone: '(11) 99999-9999',
      titular_email: 'joao@example.com',
      quarto_id: 'quarto-1',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: todayStr,
      check_out: inTwoDaysStr,
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      valor_total: '450.00',
      detalhamento_diarias: [],
      status: 'check_in',
      token_fnrh: 'tok-1',
      token_fnrh_ativo: true,
      fnrh_enviada_em: null,
      fichas_preenchidas: 1,
      total_hospedes: 2,
      observacoes: 'Hóspede prefere quarto no andar térreo',
      quarto: {
        id: 'quarto-1',
        identificacao: '101',
        categoria_nome: 'Standard',
      },
      hospedes: [
        {
          id: 'hosp-1',
          posicao: 1,
          ficha_status: 'preenchida',
          preenchido_por: 'cliente',
          preenchido_em: null,
          nome_completo: 'João Silva',
          numero_documento: '123.456.789-00',
          nacionalidade: 'Brasileira',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          profissao: null,
          tipo_documento: 'cpf',
          logradouro: null,
          numero_endereco: null,
          complemento: null,
          bairro: null,
          cidade: null,
          estado: null,
          cep: null,
          pais_residencia: null,
          telefone: '(11) 99999-9999',
          email: 'joao@example.com',
          motivo_viagem: null,
          meio_transporte: null,
          responsavel_posicao: null,
        },
      ],
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: 'res-confirmada',
      hotel_id: 'hotel-1',
      codigo: 'RES-002',
      titular_nome: 'Maria Santos',
      titular_telefone: '(11) 88888-8888',
      titular_email: 'maria@example.com',
      quarto_id: 'quarto-2',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: inTwoDaysStr,
      check_out: inFiveDaysStr,
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      valor_total: '900.00',
      detalhamento_diarias: [],
      status: 'confirmada',
      token_fnrh: 'tok-2',
      token_fnrh_ativo: true,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 2,
      observacoes: 'Lua de mel',
      quarto: {
        id: 'quarto-2',
        identificacao: '102',
        categoria_nome: 'Deluxe',
      },
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: 'res-aconfirmar',
      hotel_id: 'hotel-1',
      codigo: 'RES-003',
      titular_nome: 'Carlos Drummond',
      titular_telefone: '(11) 77777-7777',
      titular_email: 'carlos@example.com',
      quarto_id: 'quarto-1',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: inThreeDaysStr,
      check_out: inFiveDaysStr,
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '300.00',
      detalhamento_diarias: [],
      status: 'a_confirmar',
      token_fnrh: 'tok-3',
      token_fnrh_ativo: true,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 1,
      observacoes: null,
      quarto: {
        id: 'quarto-1',
        identificacao: '101',
        categoria_nome: 'Standard',
      },
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: 'res-cancelada',
      hotel_id: 'hotel-1',
      codigo: 'RES-004',
      titular_nome: 'Reserva Cancelada',
      titular_telefone: null,
      titular_email: null,
      quarto_id: 'quarto-1',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: todayStr,
      check_out: inFiveDaysStr,
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '500.00',
      detalhamento_diarias: [],
      status: 'cancelada',
      token_fnrh: 'tok-4',
      token_fnrh_ativo: false,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 1,
      observacoes: 'Cancelada pelo cliente',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: 'res-checkout',
      hotel_id: 'hotel-1',
      codigo: 'RES-005',
      titular_nome: 'Reserva Check-out',
      titular_telefone: null,
      titular_email: null,
      quarto_id: 'quarto-2',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: todayStr,
      check_out: inTwoDaysStr,
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '400.00',
      detalhamento_diarias: [],
      status: 'check_out',
      token_fnrh: 'tok-5',
      token_fnrh_ativo: false,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 1,
      observacoes: 'Já realizou checkout',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: 'res-noshow',
      hotel_id: 'hotel-1',
      codigo: 'RES-006',
      titular_nome: 'Reserva No Show',
      titular_telefone: null,
      titular_email: null,
      quarto_id: 'quarto-1',
      regime_alimentacao_id: 'reg-1',
      parceiro_id: null,
      check_in: todayStr,
      check_out: inTwoDaysStr,
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '350.00',
      detalhamento_diarias: [],
      status: 'no_show',
      token_fnrh: 'tok-6',
      token_fnrh_ativo: false,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 1,
      observacoes: 'Não compareceu',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(quartosService.list).mockResolvedValue({
      data: mockQuartosList,
      meta: {
        total: mockQuartosList.length,
        pagina: 1,
        limite: 250,
        total_paginas: 1,
      },
    })
    vi.mocked(reservasService.list).mockResolvedValue({
      data: mockReservasList,
      meta: {
        total: mockReservasList.length,
        pagina: 1,
        limite: 250,
        total_paginas: 1,
        ultima_pagina: 1,
      },
    })
  })

  it('renderiza a barra de controles, filtros de período e quartos dinâmicos sem título ou linha divisória', async () => {
    const { container } = renderCalendario()

    // Não deve exibir título, subtítulo ou linha divisória (hr) do PageHeader
    expect(
      screen.queryByRole('heading', { name: 'Calendário de Reservas' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Visualize e gerencie as reservas do hotel')
    ).not.toBeInTheDocument()
    expect(container.querySelector('hr')).not.toBeInTheDocument()

    // Exibe "Calendário" em negrito no centro da barra superior
    const calendarLabel = screen.getByText('Calendário')
    expect(calendarLabel).toBeInTheDocument()
    expect(calendarLabel).toHaveClass('font-bold')

    // Quartos dinâmicos carregados da API
    expect(await screen.findByText('101')).toBeInTheDocument()
    expect(screen.getByText('102')).toBeInTheDocument()
    expect(screen.getByText('103')).toBeInTheDocument()
    expect(screen.getAllByText('Standard').length).toBeGreaterThan(0)
    expect(screen.getByText('Deluxe')).toBeInTheDocument()

    // Controles de data e navegação
    expect(
      screen.getByTestId('calendar-datepicker-trigger')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Selecionar mês e ano')).toBeInTheDocument()
    expect(screen.getByTitle('Voltar 15 dias')).toBeInTheDocument()
    expect(screen.getByTitle('Dia anterior')).toBeInTheDocument()
    expect(screen.getByTitle('Próximo dia')).toBeInTheDocument()
    expect(screen.getByTitle('Avançar 15 dias')).toBeInTheDocument()

    // Botão de ação Nova Reserva mantido na barra de ações inferior
    const novaReservaBtn = screen.getByRole('button', { name: 'Nova Reserva' })
    expect(novaReservaBtn).toBeInTheDocument()
    expect(novaReservaBtn.closest('div.border-t')).toBeInTheDocument()
  })

  it('permite abrir o seletor de mês e ano em popover e escolher um mês na grade abreviada', async () => {
    renderCalendario()

    await screen.findByText('101')

    const trigger = screen.getByTestId('calendar-datepicker-trigger')
    fireEvent.click(trigger)

    // Popover deve exibir os selects de mês e ano e a grade de meses abreviados
    expect(
      await screen.findByTestId('calendar-datepicker-popover')
    ).toBeInTheDocument()
    expect(screen.getByTestId('calendar-select-month')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-select-year')).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Grade de meses' })
    ).toBeInTheDocument()

    const currentYear = new Date().getFullYear()
    const dezBtn = screen.getByTestId('calendar-picker-month-11')
    expect(dezBtn).toHaveTextContent('Dez')

    fireEvent.click(dezBtn)

    expect(trigger).toHaveTextContent(`Dezembro de ${currentYear}`)
  })

  it('permite abrir o modal de detalhes ao clicar em uma reserva com dados reais da API', async () => {
    renderCalendario()

    await screen.findByText('101')

    // Clica em uma célula de reserva (div com role="button" e cursor-pointer)
    const clickableCells = document.querySelectorAll('td div.cursor-pointer')
    expect(clickableCells.length).toBeGreaterThan(0)

    fireEvent.click(clickableCells[0])

    expect(await screen.findByText('Detalhes da Reserva')).toBeInTheDocument()
    expect(
      screen.getByText('Informações completas sobre a hospedagem')
    ).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument()
    expect(screen.getByText('R$ 450.00')).toBeInTheDocument()
    expect(
      screen.getByText('Hóspede prefere quarto no andar térreo')
    ).toBeInTheDocument()
  })

  it('aplica corretamente as classes de ocupação total, isolamento e z-index no grid', async () => {
    const { container } = renderCalendario()

    await screen.findByText('101')

    // Container raiz do calendário ocupando todo o espaço sem padding externo e isolado
    const rootContainer = container.firstElementChild
    expect(rootContainer).toHaveClass(
      '-m-6',
      'flex',
      'flex-1',
      'flex-col',
      'h-[calc(100%+3rem)]',
      'min-h-0',
      'overflow-hidden',
      'isolate'
    )

    // thead com z-20
    const thead = container.querySelector('thead')
    expect(thead).toHaveClass('sticky', 'top-0', 'z-20')

    // Canto superior esquerdo com z-30
    const cornerHeader = container.querySelector('thead th.sticky')
    expect(cornerHeader).toHaveClass('sticky', 'left-0', 'bg-muted', 'z-30')

    // Headers de data possuem bg-muted e destaque de hoje
    const dateHeaders = container.querySelectorAll('thead th')
    expect(dateHeaders.length).toBeGreaterThan(2)
    expect(dateHeaders[1]).toHaveClass('bg-primary/10')
    expect(dateHeaders[2]).toHaveClass('bg-muted')

    // Colunas sticky de quarto com z-10
    const roomStickyCells = container.querySelectorAll('tbody td.sticky')
    expect(roomStickyCells.length).toBeGreaterThan(0)
    expect(roomStickyCells[0]).toHaveClass('sticky', 'left-0', 'z-10')

    // Container de reserva nas células possui isolate
    const cellContainers = container.querySelectorAll(
      'tbody td .relative.w-full.h-8'
    )
    expect(cellContainers.length).toBeGreaterThan(0)
    expect(cellContainers[0]).toHaveClass('isolate')
  })

  it('filtra rigorosamente as reservas exibindo apenas a_confirmar, confirmada e check_in, omitindo cancelada, check_out e no_show', async () => {
    renderCalendario()

    await screen.findByText('101')

    // As reservas permitidas devem estar no documento ou no fluxo de detalhes
    const clickableCells = document.querySelectorAll('td div.cursor-pointer')
    expect(clickableCells.length).toBeGreaterThan(0)

    // Clicar em cada reserva renderizada e verificar que NENHUMA é 'cancelada', 'check_out' ou 'no_show'
    for (const cell of clickableCells) {
      fireEvent.click(cell)
      expect(screen.queryByText('Reserva Cancelada')).not.toBeInTheDocument()
      expect(screen.queryByText('Reserva Check-out')).not.toBeInTheDocument()
      expect(screen.queryByText('Reserva No Show')).not.toBeInTheDocument()
    }
  })

  it('aplica os 3 estilos visuais nas reservas: check_in (bg-primary), confirmada (bg-primary/50) e a_confirmar (bg-reservation-to-confirm)', async () => {
    renderCalendario()

    await screen.findByText('101')

    const clickableCells = document.querySelectorAll('td div.cursor-pointer')
    expect(clickableCells.length).toBeGreaterThan(0)

    // Pelo menos uma célula com check_in deve ter bg-primary sólida
    const hasCheckInSolid = Array.from(clickableCells).some(
      cell =>
        cell.classList.contains('bg-primary') &&
        !cell.classList.contains('bg-primary/50')
    )
    expect(hasCheckInSolid).toBe(true)

    // Pelo menos uma célula com confirmada deve ter bg-primary/50
    const hasConfirmedSemiTransparent = Array.from(clickableCells).some(cell =>
      cell.classList.contains('bg-primary/50')
    )
    expect(hasConfirmedSemiTransparent).toBe(true)

    // Pelo menos uma célula com a_confirmar deve ter o tema zebrinha diagonal (bg-reservation-to-confirm)
    const hasToConfirmZebra = Array.from(clickableCells).some(cell =>
      cell.classList.contains('bg-reservation-to-confirm')
    )
    expect(hasToConfirmZebra).toBe(true)
  })

  it('calcula o status operacional do quarto dinamicamente (disponivel, ocupado, bloqueado)', async () => {
    renderCalendario()

    await screen.findByText('101')

    // Quarto 101 tem reserva com check_in hoje -> ocupado (bg-status-occupied)
    const room101Row = screen.getByText('101').closest('tr')
    expect(room101Row?.querySelector('.bg-status-occupied')).toBeInTheDocument()

    // Quarto 103 tem status: 'N' -> bloqueado (bg-status-blocked)
    const room103Row = screen.getByText('103').closest('tr')
    expect(room103Row?.querySelector('.bg-status-blocked')).toBeInTheDocument()

    // Quarto 102 não tem check-in hoje e está ativo -> disponivel (bg-status-available)
    const room102Row = screen.getByText('102').closest('tr')
    expect(
      room102Row?.querySelector('.bg-status-available')
    ).toBeInTheDocument()
  })
})
