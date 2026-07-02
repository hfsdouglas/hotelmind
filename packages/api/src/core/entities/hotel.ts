export interface HotelProps {
  id: string
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  website?: string | null
  status?: string
}

export class Hotel {
  readonly id: string
  readonly nome_hotel: string
  readonly nome_fantasia: string
  readonly razao_social: string
  readonly cnpj: string
  readonly email_comercial: string
  readonly telefone_comercial: string
  readonly website: string | null
  readonly status: string

  constructor(props: HotelProps) {
    this.id = props.id
    this.nome_hotel = props.nome_hotel
    this.nome_fantasia = props.nome_fantasia
    this.razao_social = props.razao_social
    this.cnpj = props.cnpj
    this.email_comercial = props.email_comercial
    this.telefone_comercial = props.telefone_comercial
    this.website = props.website ?? null
    this.status = props.status ?? 'S'
  }

  static create(props: HotelProps): Hotel {
    return new Hotel(props)
  }
}
