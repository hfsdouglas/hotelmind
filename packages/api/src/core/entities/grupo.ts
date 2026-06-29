export interface GrupoProps {
  id: string
  hotel_id: string
  grupo: string
  descricao: string | null
  status: string
  created_at: Date
  updated_at: Date
}

export class Grupo {
  readonly id: string
  readonly hotel_id: string
  readonly grupo: string
  readonly descricao: string | null
  readonly status: string
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: GrupoProps) {
    this.id = props.id
    this.hotel_id = props.hotel_id
    this.grupo = props.grupo
    this.descricao = props.descricao
    this.status = props.status
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }

  get is_ativo(): boolean {
    return this.status === 'S'
  }

  static create(props: GrupoProps): Grupo {
    return new Grupo(props)
  }
}
