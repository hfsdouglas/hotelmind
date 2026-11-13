import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Reservation } from '@/types/calendario_reserva'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatar_brl(valor: number): string {
  return BRL.format(valor).replace(/ /g, ' ')
}

export function formatar_data(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatar_diarias(diarias: number): string {
  return `${diarias} ${diarias === 1 ? 'diária' : 'diárias'}`
}

export function formatar_pessoas(
  reservation: Pick<Reservation, 'adultos' | 'criancas'>
): string {
  const { adultos, criancas } = reservation
  const a = `${adultos} ${adultos === 1 ? 'adulto' : 'adultos'}`
  if (criancas <= 0) return a
  return `${a}, ${criancas} ${criancas === 1 ? 'criança' : 'crianças'}`
}
