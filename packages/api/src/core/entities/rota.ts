export interface RotaProps {
  id: string
  modulo: string
  recurso: string
  rota: string
  icone: string | null
  ordem: number
  ativo: boolean
}

export class Rota {
  readonly id: string
  readonly modulo: string
  readonly recurso: string
  readonly rota: string
  readonly icone: string | null
  readonly ordem: number
  readonly ativo: boolean

  constructor(props: RotaProps) {
    this.id = props.id
    this.modulo = props.modulo
    this.recurso = props.recurso
    this.rota = props.rota
    this.icone = props.icone
    this.ordem = props.ordem
    this.ativo = props.ativo
  }

  static create(props: RotaProps): Rota {
    return new Rota(props)
  }
}
