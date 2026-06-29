export interface UserProps {
  id: string
  hotel_id: string
  nome_completo: string
  email: string
  senha: string
  nascimento: Date
  genero: string
  celular: string
  cpf: string
  rg?: string | null
  grupos_ids?: string | null
  created_at?: Date
  updated_at?: Date
}

export class User {
  readonly id: string
  readonly hotel_id: string
  readonly nome_completo: string
  readonly email: string
  readonly senha: string
  readonly nascimento: Date
  readonly genero: string
  readonly celular: string
  readonly cpf: string
  readonly rg: string | null
  readonly grupos_ids: string | null
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: UserProps) {
    this.id = props.id
    this.hotel_id = props.hotel_id
    this.nome_completo = props.nome_completo
    this.email = props.email
    this.senha = props.senha
    this.nascimento = props.nascimento
    this.genero = props.genero
    this.celular = props.celular
    this.cpf = props.cpf
    this.rg = props.rg ?? null
    this.grupos_ids = props.grupos_ids ?? null
    this.created_at = props.created_at ?? new Date()
    this.updated_at = props.updated_at ?? new Date()
  }

  get first_name(): string {
    return this.nome_completo.trim().split(' ')[0] ?? ''
  }

  static create(props: UserProps): User {
    return new User(props)
  }
}
