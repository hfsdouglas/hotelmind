import { TIPOS_CAMA, type TipoCama } from '@hotelmind/contracts'

export interface ConfiguracaoCamaProps {
  id: string
  tipo: string
  quantidade: number
}

export class ConfiguracaoCama {
  readonly id: string
  readonly tipo: TipoCama
  readonly quantidade: number

  constructor(props: ConfiguracaoCamaProps) {
    if (!TIPOS_CAMA.includes(props.tipo as TipoCama))
      throw new Error('Tipo de cama inválido.')
    if (!Number.isInteger(props.quantidade) || props.quantidade <= 0) {
      throw new Error('A quantidade de camas deve ser positiva.')
    }
    this.id = props.id
    this.tipo = props.tipo as TipoCama
    this.quantidade = props.quantidade
  }
}
