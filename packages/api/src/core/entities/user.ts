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
  }

  static create(props: UserProps): User {
    return new User(props)
  }
}
