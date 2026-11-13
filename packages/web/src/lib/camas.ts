import type { ConfiguracaoCama, TipoCama } from '@hotelmind/contracts'

export const CAMA_LABEL: Record<TipoCama, string> = {
  solteiro: 'Solteiro',
  casal: 'Casal',
  queen: 'Queen',
  king: 'King',
  beliche: 'Beliche',
  sofa_cama: 'Sofá-cama',
}

export function formatar_camas(
  camas: Pick<ConfiguracaoCama, 'tipo' | 'quantidade'>[]
): string {
  if (camas.length === 0) return 'Não informada'
  return camas.map(c => `${c.quantidade} ${CAMA_LABEL[c.tipo]}`).join(', ')
}
