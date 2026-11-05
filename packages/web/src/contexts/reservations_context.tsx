import { createContext, type ReactNode, useContext } from 'react'

export interface Guest {
  nome: string
  email: string
  telefone: string
  documento: string
}

export interface Payment {
  metodo: string
  valor: number
  status: string
}

export interface Reservation {
  id: string
  quartoId: string
  checkIn: string
  checkOut: string
  hospede: Guest
  pagamento: Payment
  observacoes?: string
  status: string
  status_code: number
}

export interface ReservationsContextType {
  reservations: Reservation[]
  getReservationsByRoom: (roomId: string) => Reservation[]
  getReservationById: (id: string) => Reservation | undefined
}

export const ReservationsContext = createContext<
  ReservationsContextType | undefined
>(undefined)

export interface ReservationsProviderProps {
  children: ReactNode
  reservations: Reservation[]
}

export function ReservationsProvider({
  children,
  reservations,
}: ReservationsProviderProps) {
  const getReservationsByRoom = (roomId: string) => {
    return reservations.filter(reservation => reservation.quartoId === roomId)
  }

  const getReservationById = (id: string) => {
    return reservations.find(reservation => reservation.id === id)
  }

  return (
    <ReservationsContext.Provider
      value={{
        reservations,
        getReservationsByRoom,
        getReservationById,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  )
}

export function useReservations() {
  const context = useContext(ReservationsContext)

  if (!context) {
    throw new Error('useReservations must be used within ReservationsProvider')
  }

  return context
}
