import type { FichaStatus } from '@hotelmind/contracts'
import type { CalendarioHospede } from '@/types/calendario_reserva'

const FICHA_STATUS_LABEL: Record<FichaStatus, string> = {
  pendente: 'Pendente',
  rascunho: 'Rascunho',
  preenchida: 'Preenchida',
}

export function fichas_pendentes(
  hospedes: CalendarioHospede[]
): CalendarioHospede[] {
  return hospedes
    .filter(h => h.ficha_status !== 'preenchida')
    .sort((a, b) => a.posicao - b.posicao)
}

export function primeira_ficha_pendente(
  hospedes: CalendarioHospede[]
): CalendarioHospede | null {
  return fichas_pendentes(hospedes)[0] ?? null
}

export function rotulo_hospede(
  hospede: Pick<CalendarioHospede, 'posicao' | 'nome'>
): string {
  return hospede.nome || `Hóspede ${hospede.posicao}`
}

export function rotulo_ficha_status(status: FichaStatus): string {
  return FICHA_STATUS_LABEL[status]
}
