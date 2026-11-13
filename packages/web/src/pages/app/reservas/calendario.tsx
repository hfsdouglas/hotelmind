import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { useQuery } from '@tanstack/react-query'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quartosService } from '@/api/quartos.service'
import { reservasService } from '@/api/reservas.service'
import { CalendarDayCell } from '@/components/reservas/calendar_day_cell'
import { CalendarioBarraAcoes } from '@/components/reservas/calendario_barra_acoes'
import { ModalCheckInReserva } from '@/components/reservas/modal_check_in_reserva'
import { ModalDetalhesReserva } from '@/components/reservas/modal_detalhes_reserva'
import { ModalNovaReserva } from '@/components/reservas/modal_nova_reserva'
import { SuiteStatusIndicator } from '@/components/reservas/suite_status_indicator'
import {
  ReservationsProvider,
  useReservations,
} from '@/contexts/reservations_context'
import { useCalendarRangeSelection } from '@/hooks/use_calendar_range_selection'
import { useCheckInReserva } from '@/hooks/use_check_in_reserva'
import { usePageTitle } from '@/hooks/use_document_title'
import { useReservaSelecionada } from '@/hooks/use_reserva_selecionada'
import {
  format_range_announcement,
  range_to_periodo,
  to_iso_day,
} from '@/lib/calendar_range_selection'
import {
  filtrar_reservas_calendario,
  map_quarto_to_room,
  map_reserva_to_calendario,
} from '@/lib/calendario_reserva'
import type { OpcaoCheckIn, Room } from '@/types/calendario_reserva'

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const monthShortNames = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

interface CalendarioContentProps {
  rooms: Room[]
}

function CalendarioContent({ rooms }: CalendarioContentProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [startDate, setStartDate] = useState(today)
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [datepickerOpen, setDatepickerOpen] = useState(false)
  const { reservations, getReservationsByRoom } = useReservations()
  const navigate = useNavigate()
  const [novaReservaOpen, setNovaReservaOpen] = useState(false)
  const [detalhesOpen, setDetalhesOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const opcaoCheckInRef = useRef<OpcaoCheckIn>('confirmar')
  const gridRef = useRef<HTMLDivElement>(null)
  const actionsBarRef = useRef<HTMLDivElement>(null)
  const { selection, isDragging, startDrag, extendDrag, clear, getCellState } =
    useCalendarRangeSelection({
      regionRefs: [gridRef, actionsBarRef],
      paused: novaReservaOpen || detalhesOpen || checkInOpen,
    })
  const idsVisiveis = useMemo(() => reservations.map(r => r.id), [reservations])
  const { selecionadaId, selecionar, limpar } = useReservaSelecionada({
    regionRefs: [gridRef, actionsBarRef],
    paused: novaReservaOpen || detalhesOpen || checkInOpen,
    idsVisiveis,
  })
  const reservaSelecionada =
    reservations.find(r => r.id === selecionadaId) ?? null

  const { realizarCheckIn, isPending: checkInPending } = useCheckInReserva({
    onSucesso: reserva => {
      setCheckInOpen(false)
      if (opcaoCheckInRef.current === 'preencher_fnrh') {
        navigate(`/reservas/${reserva.id}?fnrh=pendente`)
      }
    },
    onNaoEncontrada: () => {
      setCheckInOpen(false)
      limpar()
    },
    onTransicaoInvalida: () => setCheckInOpen(false),
  })

  function handleSelectReservation(reservation: { id: string }) {
    clear()
    selecionar(reservation.id)
  }

  function handleRangeStart(
    quarto: { id: string; identificacao: string },
    dia: string
  ) {
    limpar()
    startDrag(quarto, dia)
  }

  function handleConfirmarCheckIn(opcao: OpcaoCheckIn) {
    if (!reservaSelecionada) return
    opcaoCheckInRef.current = opcao
    realizarCheckIn({
      id: reservaSelecionada.id,
      codigo: reservaSelecionada.codigo,
    })
  }

  const currentYear = today.getFullYear()
  const minYear = Math.min(currentYear - 5, selectedYear - 2)
  const maxYear = Math.max(currentYear + 10, selectedYear + 5)
  const availableYears = useMemo(() => {
    const years: number[] = []
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y)
    }
    return years
  }, [minYear, maxYear])

  // Calcula quantos dias cabem na tela (mínimo 15)
  // A tabela se estende conforme o espaço disponível, sem scroll horizontal
  const [daysToShow, setDaysToShow] = useState(15)

  useEffect(() => {
    const calculateDays = () => {
      // Calcula baseado na largura disponível
      // O conteúdo é fixo considerando a sidebar minimizada (ícone: 3rem = ~48px)
      // Quando expandida, a sidebar sobrepõe além desse espaço fixo
      // Considera: sidebar ícone (48px), padding (64px), coluna de quartos (120px), toolbar (~400px)
      const sidebarIconWidth = 48 // 3rem
      const padding = 64
      const roomColumnWidth = 120
      const toolbarWidth = 400
      const minCellWidth = 50 // Largura mínima por célula de dia

      const availableWidth =
        window.innerWidth -
        sidebarIconWidth -
        padding -
        roomColumnWidth -
        toolbarWidth
      const calculatedDays = Math.max(
        15,
        Math.floor(availableWidth / minCellWidth)
      )
      setDaysToShow(calculatedDays)
    }

    calculateDays()
    window.addEventListener('resize', calculateDays)
    return () => window.removeEventListener('resize', calculateDays)
  }, [])

  // Gera os dias a partir da data inicial
  const days = useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date
    })
  }, [startDate, daysToShow])

  // Sincroniza mês e ano quando startDate muda
  useEffect(() => {
    setSelectedMonth(startDate.getMonth())
    setSelectedYear(startDate.getFullYear())
  }, [startDate])

  const handleSelectMonthYear = (year: number, month: number) => {
    clear()
    limpar()
    setSelectedYear(year)
    setSelectedMonth(month)
    if (year === today.getFullYear() && month === today.getMonth()) {
      setStartDate(today)
    } else {
      setStartDate(new Date(year, month, 1))
    }
  }

  const handlePreviousDay = () => {
    clear()
    limpar()
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 1)
      return newDate
    })
  }

  const handleNextDay = () => {
    clear()
    limpar()
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 1)
      return newDate
    })
  }

  const handlePreviousWeek = () => {
    clear()
    limpar()
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 15)
      return newDate
    })
  }

  const handleNextWeek = () => {
    clear()
    limpar()
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 15)
      return newDate
    })
  }

  return (
    <div className="-m-6 flex flex-1 flex-col h-[calc(100%+3rem)] min-h-0 overflow-hidden isolate">
      {/* Filtros de período e navegação */}
      <div className="grid grid-cols-3 items-center px-4 py-2 bg-background shrink-0">
        <div className="flex items-center gap-3 justify-self-start">
          <Popover open={datepickerOpen} onOpenChange={setDatepickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="calendar-datepicker-trigger"
                aria-label="Selecionar mês e ano"
                className="h-8 justify-start gap-2 px-3 text-xs font-medium"
              >
                <CalendarIcon
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>
                  {months[selectedMonth]} de {selectedYear}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              data-testid="calendar-datepicker-popover"
              className="w-[280px] p-3"
            >
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[1fr_100px] gap-2">
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={val =>
                      handleSelectMonthYear(selectedYear, Number(val))
                    }
                  >
                    <SelectTrigger
                      data-testid="calendar-select-month"
                      aria-label="Selecionar mês"
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((monthName, index) => (
                        <SelectItem
                          key={monthName}
                          value={String(index)}
                          className="text-xs"
                        >
                          {monthName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(selectedYear)}
                    onValueChange={val =>
                      handleSelectMonthYear(Number(val), selectedMonth)
                    }
                  >
                    <SelectTrigger
                      data-testid="calendar-select-year"
                      aria-label="Selecionar ano"
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                          className="text-xs"
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* biome-ignore lint/a11y/useSemanticElements: month grid group */}
                <div
                  role="group"
                  aria-label="Grade de meses"
                  className="grid grid-cols-3 gap-1.5"
                >
                  {monthShortNames.map((shortName, index) => {
                    const isActiveMonth = selectedMonth === index
                    return (
                      <Button
                        key={shortName}
                        type="button"
                        size="sm"
                        variant={isActiveMonth ? 'default' : 'ghost'}
                        data-testid={`calendar-picker-month-${index}`}
                        aria-label={months[index]}
                        aria-pressed={isActiveMonth}
                        onClick={() => {
                          handleSelectMonthYear(selectedYear, index)
                          setDatepickerOpen(false)
                        }}
                        className="h-8 text-xs"
                      >
                        {shortName}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <span className="font-bold justify-self-center">Calendário</span>

        <div className="flex gap-1 items-center justify-self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            title="Voltar 15 dias"
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
            title="Dia anterior"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            title="Próximo dia"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            title="Avançar 15 dias"
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de Reservas */}
      <div
        ref={gridRef}
        className={cn(
          'flex-1 overflow-auto min-h-0',
          isDragging && 'select-none'
        )}
      >
        <table
          className="w-full border-collapse table-fixed"
          style={{ overflow: 'visible' }}
        >
          <thead className="sticky top-0 z-20">
            <tr className="bg-muted">
              <th className="p-2 text-left font-semibold sticky left-0 bg-muted z-30 w-[120px] border-r border-border"></th>
              {days.map((day, index) => (
                <th
                  key={index}
                  className={cn(
                    'p-2 text-center font-semibold border-r border-border last:border-r-0 bg-muted',
                    isSameDay(day, today) && 'bg-primary/10'
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="text-sm">{format(day, 'dd/MM')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              // Verifica se a linha contém o dia atual
              const hasTodayInRow = days.some(day => isSameDay(day, today))

              return (
                <tr
                  key={room.id}
                  className={cn(
                    'hover:bg-muted/50 border-b border-border',
                    hasTodayInRow
                      ? 'bg-muted/30'
                      : 'bg-muted/20 even:bg-muted/10'
                  )}
                >
                  <td className="p-2 sticky left-0 bg-background z-10 w-[120px] border-r border-border">
                    <SuiteStatusIndicator room={room} />
                  </td>
                  {days.map((day, dayIndex) => {
                    // Busca todas as reservas do quarto neste dia
                    const allReservations = getReservationsByRoom(
                      room.id
                    ).filter(reservation => {
                      const checkIn = new Date(reservation.checkIn)
                      checkIn.setHours(0, 0, 0, 0)
                      const checkOut = new Date(reservation.checkOut)
                      checkOut.setHours(0, 0, 0, 0)
                      const currentDate = new Date(day)
                      currentDate.setHours(0, 0, 0, 0)

                      return (
                        isSameDay(currentDate, checkIn) ||
                        (currentDate > checkIn && currentDate < checkOut) ||
                        isSameDay(currentDate, checkOut)
                      )
                    })

                    // Separa reservas por tipo (check-in, check-out, ou intermediárias)
                    const reservationsForCheckIn = allReservations.filter(r =>
                      isSameDay(day, new Date(r.checkIn))
                    )
                    const reservationsForCheckOut = allReservations.filter(
                      r =>
                        isSameDay(day, new Date(r.checkOut)) &&
                        !isSameDay(day, new Date(r.checkIn))
                    )
                    const reservationsIntermediate = allReservations.filter(
                      r =>
                        !isSameDay(day, new Date(r.checkIn)) &&
                        !isSameDay(day, new Date(r.checkOut))
                    )

                    return (
                      <CalendarDayCell
                        key={dayIndex}
                        quarto={room}
                        day={day}
                        reservationsIntermediate={reservationsIntermediate}
                        reservationsForCheckOut={reservationsForCheckOut}
                        reservationsForCheckIn={reservationsForCheckIn}
                        selectionState={getCellState(room.id, to_iso_day(day))}
                        selectedReservationId={selecionadaId}
                        isDragging={isDragging}
                        onSelectReservation={handleSelectReservation}
                        onRangeStart={handleRangeStart}
                        onRangeExtend={extendDrag}
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div role="status" className="sr-only">
        {format_range_announcement(selection)}
      </div>

      <CalendarioBarraAcoes
        containerRef={actionsBarRef}
        reservaSelecionada={reservaSelecionada}
        onNovaReserva={() => setNovaReservaOpen(true)}
        onCheckIn={() => setCheckInOpen(true)}
        onDetalhes={() => setDetalhesOpen(true)}
      />

      <ModalNovaReserva
        open={novaReservaOpen}
        onOpenChange={setNovaReservaOpen}
        valoresIniciais={selection ? range_to_periodo(selection) : undefined}
        quartoPreferido={
          selection
            ? {
                id: selection.quarto_id,
                identificacao: selection.quarto_identificacao,
              }
            : undefined
        }
        onCreated={() => {
          setNovaReservaOpen(false)
          clear()
        }}
      />

      <ModalCheckInReserva
        open={checkInOpen}
        reservation={reservaSelecionada}
        hoje={today}
        isPending={checkInPending}
        onOpenChange={setCheckInOpen}
        onConfirmar={handleConfirmarCheckIn}
      />

      <ModalDetalhesReserva
        open={detalhesOpen}
        reservation={reservaSelecionada}
        onOpenChange={setDetalhesOpen}
      />
    </div>
  )
}

export function Calendario() {
  usePageTitle('Calendário de Reservas')

  const { data: quartosData } = useQuery({
    queryKey: ['quartos', 'calendario'],
    queryFn: () => quartosService.list({ limite: 250, direcao: 'asc' }),
  })

  const { data: reservasData } = useQuery({
    queryKey: ['reservas', 'calendario'],
    queryFn: () => reservasService.list({ limite: 250 }),
  })

  const reservations = useMemo(() => {
    if (!reservasData?.data) return []
    const quartos = new Map((quartosData?.data ?? []).map(q => [q.id, q]))
    return filtrar_reservas_calendario(reservasData.data).map(r =>
      map_reserva_to_calendario(r, quartos.get(r.quarto_id))
    )
  }, [reservasData, quartosData])

  const rooms = useMemo<Room[]>(
    () =>
      (quartosData?.data ?? []).map(q => map_quarto_to_room(q, reservations)),
    [quartosData, reservations]
  )

  return (
    <ReservationsProvider reservations={reservations}>
      <CalendarioContent rooms={rooms} />
    </ReservationsProvider>
  )
}
