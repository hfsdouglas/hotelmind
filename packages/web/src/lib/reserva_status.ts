import { isAfter, startOfDay } from 'date-fns'
import type { AvaliacaoCheckIn, Reservation } from '@/types/calendario_reserva'

export const MOTIVO_SEM_SELECAO = 'Selecione uma reserva para fazer check-in'
export const MOTIVO_A_CONFIRMAR = 'Confirme a reserva antes do check-in'
export const MOTIVO_JA_REALIZADO = 'Check-in já realizado'

export function avaliar_check_in(
  reserva: Reservation | null
): AvaliacaoCheckIn {
  if (!reserva) return { permitido: false, motivo: MOTIVO_SEM_SELECAO }
  if (reserva.status === 'a_confirmar') {
    return { permitido: false, motivo: MOTIVO_A_CONFIRMAR }
  }
  if (reserva.status === 'check_in') {
    return { permitido: false, motivo: MOTIVO_JA_REALIZADO }
  }
  return { permitido: true }
}

export function is_check_in_antecipado(check_in: string, hoje: Date): boolean {
  return isAfter(startOfDay(new Date(check_in)), startOfDay(hoje))
}
