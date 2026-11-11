import type { ReservaStatus } from '@hotelmind/contracts'
import { useQuery } from '@tanstack/react-query'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { quartosService } from '@/api/quartos.service'
import { reservasService } from '@/api/reservas.service'
import { ReservationCell } from '@/components/reservas/reservation_cell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type Reservation,
  ReservationsProvider,
  useReservations,
} from '@/contexts/reservations_context'
import { usePageTitle } from '@/hooks/use_document_title'
import { cn } from '@/lib/utils'

export type RoomStatus =
  | 'disponivel'
  | 'bloqueado'
  | 'manutencao'
  | 'limpeza'
  | 'ocupado'

export interface Room {
  id: string
  numero: string
  tipo: string
  status: RoomStatus
}

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
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const { getReservationsByRoom } = useReservations()

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
    setSelectedYear(year)
    setSelectedMonth(month)
    if (year === today.getFullYear() && month === today.getMonth()) {
      setStartDate(today)
    } else {
      setStartDate(new Date(year, month, 1))
    }
  }

  const handlePreviousDay = () => {
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 1)
      return newDate
    })
  }

  const handleNextDay = () => {
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 1)
      return newDate
    })
  }

  const handlePreviousWeek = () => {
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 15)
      return newDate
    })
  }

  const handleNextWeek = () => {
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
      <div className="flex-1 overflow-auto min-h-0">
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-default">
                            <div
                              className={cn(
                                'size-2 rounded-full shrink-0',
                                room.status === 'disponivel' &&
                                  'bg-status-available',
                                room.status === 'bloqueado' &&
                                  'bg-status-blocked',
                                room.status === 'manutencao' &&
                                  'bg-status-maintenance',
                                room.status === 'limpeza' &&
                                  'bg-status-cleaning',
                                room.status === 'ocupado' &&
                                  'bg-status-occupied'
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm">
                                {room.numero}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {room.tipo}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {room.status === 'disponivel'
                              ? 'Disponível'
                              : room.status === 'bloqueado'
                                ? 'Bloqueado'
                                : room.status === 'manutencao'
                                  ? 'Manutenção'
                                  : room.status === 'limpeza'
                                    ? 'Limpeza'
                                    : 'Ocupado'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

                    const hasReservations = allReservations.length > 0

                    return (
                      <td
                        key={dayIndex}
                        className={cn(
                          'p-0 text-center relative border-r border-border last:border-r-0 overflow-visible',
                          hasReservations && 'cursor-pointer'
                        )}
                      >
                        <div className="relative w-full h-8 isolate">
                          {/* Renderiza reservas intermediárias (largura total) */}
                          {reservationsIntermediate.map(reservation => (
                            <ReservationCell
                              key={reservation.id}
                              reservation={reservation}
                              day={day}
                              onSelect={setSelectedReservation}
                            />
                          ))}
                          {/* Renderiza reservas de check-out (metade esquerda) */}
                          {reservationsForCheckOut.map(reservation => (
                            <ReservationCell
                              key={reservation.id}
                              reservation={reservation}
                              day={day}
                              onSelect={setSelectedReservation}
                            />
                          ))}
                          {/* Renderiza reservas de check-in (metade direita) - por último para ficar acima */}
                          {reservationsForCheckIn.map(reservation => (
                            <ReservationCell
                              key={reservation.id}
                              reservation={reservation}
                              day={day}
                              onSelect={setSelectedReservation}
                            />
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Toolbar na parte inferior */}
      <div className="border-t bg-background shrink-0 px-4 py-2 flex items-center gap-2 justify-start">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Nova Reserva</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nova Reserva</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Modal de Detalhes da Reserva */}
      <Dialog
        open={!!selectedReservation}
        onOpenChange={open => !open && setSelectedReservation(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>
              Informações completas sobre a hospedagem
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-6 mt-4">
              {/* Informações da Reserva */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Reserva</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.checkIn),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.checkOut),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{selectedReservation.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quarto:</span>
                    <p className="font-medium">
                      {rooms.find(r => r.id === selectedReservation.quartoId)
                        ?.numero || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações do Hóspede */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Hóspede</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">
                      {selectedReservation.hospede.nome}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">
                      {selectedReservation.hospede.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="font-medium">
                      {selectedReservation.hospede.telefone}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documento:</span>
                    <p className="font-medium">
                      {selectedReservation.hospede.documento}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações de Pagamento */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Pagamento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Método:</span>
                    <p className="font-medium">
                      {selectedReservation.pagamento.metodo}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium">
                      R$ {selectedReservation.pagamento.valor.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">
                      {selectedReservation.pagamento.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedReservation.observacoes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Observações</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReservation.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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

  const reservations = useMemo<Reservation[]>(() => {
    if (!reservasData?.data) return []

    // As únicas reservas que devem aparecer no calendário são: a confirmar, confirmada e check-in.
    // O restante, não aparece: cancelada, check-out, no_show.
    const allowedStatuses: ReservaStatus[] = [
      'a_confirmar',
      'confirmada',
      'check_in',
    ]

    return reservasData.data
      .filter(r => allowedStatuses.includes(r.status))
      .map(r => {
        const isCheckIn = r.status === 'check_in'
        const statusLabel =
          r.status === 'check_in'
            ? 'Check In'
            : r.status === 'confirmada'
              ? 'Confirmada'
              : 'A Confirmar'

        const checkInStr = r.check_in.includes('T')
          ? r.check_in.split('T')[0]
          : r.check_in
        const checkOutStr = r.check_out.includes('T')
          ? r.check_out.split('T')[0]
          : r.check_out

        return {
          id: r.id,
          quartoId: r.quarto_id,
          checkIn: `${checkInStr}T00:00:00`,
          checkOut: `${checkOutStr}T00:00:00`,
          hospede: {
            nome: r.titular_nome,
            email: r.titular_email || '-',
            telefone: r.titular_telefone || '-',
            documento: r.hospedes?.[0]?.numero_documento || '-',
          },
          pagamento: {
            metodo: r.parceiro?.razao_social
              ? `Parceiro: ${r.parceiro.razao_social}`
              : 'Balcão / Reserva Direta',
            valor: Number(r.valor_total) || 0,
            status: isCheckIn ? 'Pago' : 'Pendente',
          },
          observacoes: r.observacoes || undefined,
          status: statusLabel,
          status_code:
            r.status === 'check_in' ? 1 : r.status === 'confirmada' ? 0 : 2,
        }
      })
  }, [reservasData])

  const rooms = useMemo<Room[]>(() => {
    if (!quartosData?.data) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return quartosData.data.map(q => {
      let status: RoomStatus = 'disponivel'

      if (q.status === 'N') {
        status = 'bloqueado'
      } else {
        const hasActiveCheckInToday = reservations.some(res => {
          if (res.quartoId !== q.id) return false
          if (res.status_code !== 1) return false
          const checkInDate = new Date(res.checkIn)
          checkInDate.setHours(0, 0, 0, 0)
          const checkOutDate = new Date(res.checkOut)
          checkOutDate.setHours(0, 0, 0, 0)
          return today >= checkInDate && today <= checkOutDate
        })

        if (hasActiveCheckInToday) {
          status = 'ocupado'
        }
      }

      return {
        id: q.id,
        numero: q.identificacao,
        tipo: q.categoria?.nome || 'Padrão',
        status,
      }
    })
  }, [quartosData, reservations])

  return (
    <ReservationsProvider reservations={reservations}>
      <CalendarioContent rooms={rooms} />
    </ReservationsProvider>
  )
}
