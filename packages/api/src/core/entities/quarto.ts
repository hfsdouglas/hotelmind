import { ConfiguracaoCama } from './configuracao_cama'

export interface QuartoProps {
  id: string
  hotel_id: string
  categoria_id: string
  identificacao: string
  descricao: string | null
  limite_hospedes: number
  status: string
  camas: ConfiguracaoCama[]
  categoria: { id: string; nome: string; status: string }
  created_at: Date
  updated_at: Date
}

export class Quarto {
  readonly id: string
  readonly hotel_id: string
  readonly categoria_id: string
  readonly identificacao: string
  readonly descricao: string | null
  readonly limite_hospedes: number
  readonly status: string
  readonly camas: ConfiguracaoCama[]
  readonly categoria: QuartoProps['categoria']
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: QuartoProps) {
    if (!props.identificacao.trim()) throw new Error('A identificação do quarto é obrigatória.')
    if (!Number.isInteger(props.limite_hospedes) || props.limite_hospedes <= 0) {
      throw new Error('O limite de hóspedes deve ser positivo.')
    }
    if (props.camas.length === 0) throw new Error('O quarto deve possuir uma cama.')
    this.id = props.id
    this.hotel_id = props.hotel_id
    this.categoria_id = props.categoria_id
    this.identificacao = props.identificacao.trim()
    this.descricao = props.descricao
    this.limite_hospedes = props.limite_hospedes
    this.status = props.status
    this.camas = props.camas
    this.categoria = props.categoria
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }
}
