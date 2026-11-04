import { LeadValidationError } from '@/core/errors/lead_errors'

export interface LeadProps {
  id: string
  hotel_id: string
  nome: string
  telefone: string
  email: string
  created_at: Date
  updated_at: Date
}

export class Lead {
  readonly id: string
  readonly hotel_id: string
  readonly nome: string
  readonly telefone: string
  readonly email: string
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: LeadProps) {
    const nome = props.nome.trim()
    if (!nome) {
      throw new LeadValidationError('O nome do lead é obrigatório.')
    }
    if (nome.length > 150) {
      throw new LeadValidationError(
        'O nome do lead deve ter no máximo 150 caracteres.'
      )
    }

    const telefone = props.telefone.trim()
    if (!telefone) {
      throw new LeadValidationError('O telefone do lead é obrigatório.')
    }

    const email = props.email.trim().toLowerCase()
    if (!email) {
      throw new LeadValidationError('O e-mail do lead é obrigatório.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new LeadValidationError('O e-mail informado é inválido.')
    }

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.nome = nome
    this.telefone = telefone
    this.email = email
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }
}
