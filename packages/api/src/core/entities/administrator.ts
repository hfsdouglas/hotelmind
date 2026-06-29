export interface AdministratorProps {
  id: string
  nome_completo: string
  email: string
  senha: string
  status?: string
  created_at?: Date
  updated_at?: Date
}

export class Administrator {
  readonly id: string
  readonly nome_completo: string
  readonly email: string
  readonly senha: string
  readonly status: string
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: AdministratorProps) {
    this.id = props.id
    this.nome_completo = props.nome_completo
    this.email = props.email
    this.senha = props.senha
    this.status = props.status ?? 'S'
    this.created_at = props.created_at ?? new Date()
    this.updated_at = props.updated_at ?? new Date()
  }

  get first_name(): string {
    return this.nome_completo.trim().split(' ')[0] ?? ''
  }
}
