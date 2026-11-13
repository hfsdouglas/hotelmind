import type { Reservation } from '@/types/calendario_reserva'

export function make_calendario_reservation(
  overrides: Partial<Reservation> = {}
): Reservation {
  return {
    id: 'reserva-101',
    codigo: 'RES-0101',
    quartoId: 'quarto-101',
    quarto_identificacao: '101',
    categoria_nome: 'Suíte Luxo',
    camas: [
      { id: 'cama-1', tipo: 'casal', quantidade: 1 },
      { id: 'cama-2', tipo: 'solteiro', quantidade: 1 },
    ],
    checkIn: '2026-12-02T00:00:00',
    checkOut: '2026-12-04T00:00:00',
    diarias: 2,
    status: 'confirmada',
    status_label: 'Confirmada',
    titular: { nome: 'Ana Souza', email: 'ana@example.com', telefone: null },
    adultos: 2,
    criancas: 0,
    regime_titulo: 'Pensão Completa',
    parceiro_nome: null,
    valor_total: 1500,
    observacoes: 'Chegada tardia',
    hospedes: [
      { posicao: 1, nome: 'Ana Souza', ficha_status: 'preenchida' },
      { posicao: 2, nome: 'Bruno Souza', ficha_status: 'preenchida' },
    ],
    fichas_preenchidas: 2,
    total_hospedes: 2,
    ...overrides,
  }
}

/** RES-0102: suíte 102, 2 adultos + 1 criança, parceiro, 2 fichas FNRH pendentes. */
export function make_calendario_reservation_0102(
  overrides: Partial<Reservation> = {}
): Reservation {
  return make_calendario_reservation({
    id: 'reserva-102',
    codigo: 'RES-0102',
    quartoId: 'quarto-102',
    quarto_identificacao: '102',
    camas: [{ id: 'cama-3', tipo: 'casal', quantidade: 1 }],
    checkIn: '2026-12-01T00:00:00',
    checkOut: '2026-12-03T00:00:00',
    titular: { nome: 'Fernanda Alves', email: null, telefone: null },
    adultos: 2,
    criancas: 1,
    parceiro_nome: 'Agência Sol',
    valor_total: 980.5,
    observacoes: null,
    hospedes: [
      { posicao: 1, nome: null, ficha_status: 'pendente' },
      { posicao: 2, nome: 'Carlos Lima', ficha_status: 'rascunho' },
    ],
    fichas_preenchidas: 0,
    total_hospedes: 2,
    ...overrides,
  })
}
