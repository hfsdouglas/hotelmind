import { useState, useMemo, useEffect } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { ReservationCell } from '@/components/reservation_cell'
import {
  type Reservation,
  ReservationsProvider,
  useReservations,
} from '@/contexts/reservations_context'
import { PageHeader } from '@/components/page_header'

type RoomStatus =
  | 'disponivel'
  | 'bloqueado'
  | 'manutencao'
  | 'limpeza'
  | 'ocupado'

interface Room {
  id: string
  numero: string
  tipo: string
  status: RoomStatus
}

// Dados mockados
const mockRooms: Room[] = [
  // 1º Andar - Standard
  { id: '1', numero: '101', tipo: 'Standard', status: 'ocupado' },
  { id: '2', numero: '102', tipo: 'Standard', status: 'limpeza' },
  { id: '3', numero: '103', tipo: 'Standard', status: 'disponivel' },
  { id: '4', numero: '104', tipo: 'Standard', status: 'disponivel' },
  { id: '5', numero: '105', tipo: 'Standard', status: 'ocupado' },
  { id: '6', numero: '106', tipo: 'Standard', status: 'disponivel' },
  { id: '7', numero: '107', tipo: 'Standard', status: 'limpeza' },
  { id: '8', numero: '108', tipo: 'Standard', status: 'disponivel' },

  // 2º Andar - Deluxe
  { id: '9', numero: '201', tipo: 'Deluxe', status: 'ocupado' },
  { id: '10', numero: '202', tipo: 'Deluxe', status: 'manutencao' },
  { id: '11', numero: '203', tipo: 'Deluxe', status: 'disponivel' },
  { id: '12', numero: '204', tipo: 'Deluxe', status: 'ocupado' },
  { id: '13', numero: '205', tipo: 'Deluxe', status: 'disponivel' },
  { id: '14', numero: '206', tipo: 'Deluxe', status: 'limpeza' },
  { id: '15', numero: '207', tipo: 'Deluxe', status: 'disponivel' },
  { id: '16', numero: '208', tipo: 'Deluxe', status: 'bloqueado' },

  // 3º Andar - Suite
  { id: '17', numero: '301', tipo: 'Suite', status: 'bloqueado' },
  { id: '18', numero: '302', tipo: 'Suite', status: 'disponivel' },
  { id: '19', numero: '303', tipo: 'Suite', status: 'ocupado' },
  { id: '20', numero: '304', tipo: 'Suite', status: 'disponivel' },
  { id: '21', numero: '305', tipo: 'Suite', status: 'limpeza' },
  { id: '22', numero: '306', tipo: 'Suite', status: 'disponivel' },

  // 4º Andar - Premium
  { id: '23', numero: '401', tipo: 'Premium', status: 'limpeza' },
  { id: '24', numero: '402', tipo: 'Premium', status: 'disponivel' },
  { id: '25', numero: '403', tipo: 'Premium', status: 'ocupado' },
  { id: '26', numero: '404', tipo: 'Premium', status: 'disponivel' },
  { id: '27', numero: '405', tipo: 'Premium', status: 'manutencao' },
]

const mockReservations: Reservation[] = [
  {
    id: '1',
    quartoId: '1',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: addDays(new Date(), 2).toISOString().split('T')[0],
    hospede: {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999',
      documento: '123.456.789-00',
    },
    pagamento: {
      metodo: 'Cartão de Crédito',
      valor: 450.0,
      status: 'Pago',
    },
    observacoes: 'Hóspede prefere quarto no andar térreo',
    status: 'Check In',
    status_code: 1,
  },
  {
    id: '2',
    quartoId: '1',
    checkIn: addDays(new Date(), 2).toISOString().split('T')[0],
    checkOut: addDays(new Date(), 5).toISOString().split('T')[0],
    hospede: {
      nome: 'Carlos Mendes',
      email: 'carlos@example.com',
      telefone: '(11) 66666-6666',
      documento: '555.666.777-88',
    },
    pagamento: {
      metodo: 'Cartão de Débito',
      valor: 900.0,
      status: 'Pago',
    },
    observacoes: 'Reserva consecutiva para teste visual',
    status: 'Confirmada',
    status_code: 0,
  },
  {
    id: '3',
    quartoId: '3',
    checkIn: addDays(new Date(), 1).toISOString().split('T')[0],
    checkOut: addDays(new Date(), 4).toISOString().split('T')[0],
    hospede: {
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: '(11) 88888-8888',
      documento: '987.654.321-00',
    },
    pagamento: {
      metodo: 'PIX',
      valor: 1200.0,
      status: 'Pago',
    },
    observacoes: 'Aniversário de casamento - decorar quarto',
    status: 'Confirmada',
    status_code: 0,
  },
  {
    id: '4',
    quartoId: '5',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: addDays(new Date(), 1).toISOString().split('T')[0],
    hospede: {
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      telefone: '(11) 77777-7777',
      documento: '111.222.333-44',
    },
    pagamento: {
      metodo: 'Dinheiro',
      valor: 800.0,
      status: 'Pendente',
    },
    observacoes: 'Check-in após 20h',
    status: 'Confirmada',
    status_code: 0,
  },
  {
    id: '5',
    quartoId: '3',
    checkIn: addDays(new Date(), 4).toISOString().split('T')[0],
    checkOut: addDays(new Date(), 7).toISOString().split('T')[0],
    hospede: {
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      telefone: '(11) 77777-7777',
      documento: '111.222.333-44',
    },
    pagamento: {
      metodo: 'Dinheiro',
      valor: 800.0,
      status: 'Pendente',
    },
    observacoes: 'Check-in após 20h',
    status: 'Confirmada',
    status_code: 0,
  },
]

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

function CalendarioContent() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [startDate, setStartDate] = useState(today)
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const { getReservationsByRoom } = useReservations()

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
        Math.floor(availableWidth / minCellWidth),
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

  // Atualiza startDate quando mês ou ano mudam
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, 1)
    if (newDate <= today) {
      setStartDate(today)
    } else {
      setStartDate(newDate)
    }
  }, [selectedMonth, selectedYear])

  const handlePreviousDay = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 1)
      return newDate
    })
  }

  const handleNextDay = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 1)
      return newDate
    })
  }

  const handlePreviousWeek = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 15)
      return newDate
    })
  }

  const handleNextWeek = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 15)
      return newDate
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PageHeader
        title="Calendário de Reservas"
        description="Visualize e gerencie as reservas do hotel"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="month" className="text-sm">
              Mês
            </Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}
            >
              <SelectTrigger id="month" className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <Label htmlFor="year" className="text-sm">
              Ano
            </Label>
            <Input
              id="year"
              type="number"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(parseInt(e.target.value, 10) || today.getFullYear())
              }
              className="w-20 h-8 text-sm"
              min={2020}
              max={2100}
            />
          </div>

          <div className="flex gap-1 items-center">
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
      </PageHeader>

      {/* Grid de Reservas */}
      <div className="flex-1 overflow-auto min-h-0">
        <table
          className="w-full border-collapse table-fixed"
          style={{ overflow: 'visible' }}
        >
          <thead className="sticky top-0 z-50">
            <tr className="bg-muted">
              <th className="p-2 text-left font-semibold sticky left-0 bg-muted z-20 w-[120px] border-r border-border"></th>
              {days.map((day, index) => (
                <th
                  key={index}
                  className={cn(
                    'p-2 text-center font-semibold border-r border-border last:border-r-0',
                    isSameDay(day, today) && 'bg-primary/10',
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
            {mockRooms.map((room) => {
              // Verifica se a linha contém o dia atual
              const hasTodayInRow = days.some((day) => isSameDay(day, today))

              return (
                <tr
                  key={room.id}
                  className={cn(
                    'hover:bg-muted/50 border-b border-border',
                    hasTodayInRow
                      ? 'bg-muted/30'
                      : 'bg-muted/20 even:bg-muted/10',
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
                                room.status === 'disponivel' && 'bg-green-500',
                                room.status === 'bloqueado' && 'bg-red-500',
                                room.status === 'manutencao' && 'bg-orange-500',
                                room.status === 'limpeza' && 'bg-blue-500',
                                room.status === 'ocupado' && 'bg-purple-500',
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm">
                                {room.numero}
                              </span>
                              <span className="text-xs text-muted-foreground">
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
                      room.id,
                    ).filter((reservation) => {
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
                    const reservationsForCheckIn = allReservations.filter((r) =>
                      isSameDay(day, new Date(r.checkIn)),
                    )
                    const reservationsForCheckOut = allReservations.filter(
                      (r) =>
                        isSameDay(day, new Date(r.checkOut)) &&
                        !isSameDay(day, new Date(r.checkIn)),
                    )
                    const reservationsIntermediate = allReservations.filter(
                      (r) =>
                        !isSameDay(day, new Date(r.checkIn)) &&
                        !isSameDay(day, new Date(r.checkOut)),
                    )

                    const hasReservations = allReservations.length > 0

                    return (
                      <td
                        key={dayIndex}
                        className={cn(
                          'p-0 text-center relative border-r border-border last:border-r-0 overflow-visible',
                          hasReservations && 'cursor-pointer',
                        )}
                      >
                        <div className="relative w-full h-8">
                          {/* Renderiza reservas intermediárias (largura total) */}
                          {reservationsIntermediate.map((reservation) => (
                            <ReservationCell
                              key={reservation.id}
                              reservation={reservation}
                              day={day}
                              onSelect={setSelectedReservation}
                            />
                          ))}
                          {/* Renderiza reservas de check-out (metade esquerda) */}
                          {reservationsForCheckOut.map((reservation) => (
                            <ReservationCell
                              key={reservation.id}
                              reservation={reservation}
                              day={day}
                              onSelect={setSelectedReservation}
                            />
                          ))}
                          {/* Renderiza reservas de check-in (metade direita) - por último para ficar acima */}
                          {reservationsForCheckIn.map((reservation) => (
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
      <div className="border-t bg-background shrink-0 p-2 flex items-center gap-2 justify-start">
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
        onOpenChange={(open) => !open && setSelectedReservation(null)}
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
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.checkOut),
                        'dd/MM/yyyy',
                        { locale: ptBR },
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
                      {
                        mockRooms.find(
                          (r) => r.id === selectedReservation.quartoId,
                        )?.numero
                      }
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
  return (
    <ReservationsProvider reservations={mockReservations}>
      <CalendarioContent />
    </ReservationsProvider>
  )
}
