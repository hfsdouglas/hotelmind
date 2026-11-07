export interface CategoriaQuartoProps {
  id: string
  hotel_id: string
  nome: string
  status: 'S' | 'N'
  created_at: Date
  updated_at: Date
}

export class CategoriaQuarto {
  readonly id: string
  readonly hotel_id: string
  readonly nome: string
  readonly status: 'S' | 'N'
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: CategoriaQuartoProps) {
    this.id = props.id
    this.hotel_id = props.hotel_id
    this.nome = props.nome
    this.status = props.status
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }

  get is_ativa() {
    return this.status === 'S'
  }
}
