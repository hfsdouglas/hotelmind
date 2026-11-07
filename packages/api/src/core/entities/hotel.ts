import type {
  CategoriaHotel,
  CoberturaEstacionamento,
  TipoEstacionamento,
  TipoWifi,
} from '@hotelmind/contracts'
import type { HotelTema } from './hotel_tema'

export interface HotelProps {
  id: string
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  celular?: string | null
  website?: string | null
  status?: string

  categoria?: CategoriaHotel
  classificacao_estrelas?: number
  descricao_curta?: string | null
  descricao_completa?: string | null

  limite_idade_crianca_gratis?: number
  quantidade_max_criancas_gratis?: number

  horario_checkin?: string
  horario_checkout?: string
  recepcao_24h?: boolean
  horario_abertura_recepcao?: string | null
  horario_fechamento_recepcao?: string | null

  aceita_pets?: boolean
  peso_maximo_pet_kg?: number | null
  permite_fumar?: boolean
  taxa_higienizacao_fumo?: number | null

  tipo_estacionamento?: TipoEstacionamento
  valor_diaria_estacionamento?: number | null
  estacionamento_reserva_previa?: boolean
  cobertura_estacionamento?: CoberturaEstacionamento
  possui_wifi?: boolean
  tipo_wifi?: TipoWifi
  nome_rede_wifi?: string | null
  senha_rede_wifi?: string | null
  exibir_wifi_voucher?: boolean

  tema?: HotelTema | null
}

export class Hotel {
  readonly id: string
  readonly nome_hotel: string
  readonly nome_fantasia: string
  readonly razao_social: string
  readonly cnpj: string
  readonly email_comercial: string
  readonly telefone_comercial: string
  readonly celular: string | null
  readonly website: string | null
  readonly status: string

  readonly categoria: CategoriaHotel
  readonly classificacao_estrelas: number
  readonly descricao_curta: string | null
  readonly descricao_completa: string | null

  readonly limite_idade_crianca_gratis: number
  readonly quantidade_max_criancas_gratis: number

  readonly horario_checkin: string
  readonly horario_checkout: string
  readonly recepcao_24h: boolean
  readonly horario_abertura_recepcao: string | null
  readonly horario_fechamento_recepcao: string | null

  readonly aceita_pets: boolean
  readonly peso_maximo_pet_kg: number | null
  readonly permite_fumar: boolean
  readonly taxa_higienizacao_fumo: number | null

  readonly tipo_estacionamento: TipoEstacionamento
  readonly valor_diaria_estacionamento: number | null
  readonly estacionamento_reserva_previa: boolean
  readonly cobertura_estacionamento: CoberturaEstacionamento
  readonly possui_wifi: boolean
  readonly tipo_wifi: TipoWifi
  readonly nome_rede_wifi: string | null
  readonly senha_rede_wifi: string | null
  readonly exibir_wifi_voucher: boolean

  readonly tema: HotelTema | null

  constructor(props: HotelProps) {
    if (props.recepcao_24h === false) {
      if (
        !props.horario_abertura_recepcao ||
        !props.horario_fechamento_recepcao
      ) {
        throw new Error(
          'Horários de abertura e fechamento da recepção são obrigatórios quando o funcionamento não for 24 horas.'
        )
      }
    }

    this.id = props.id
    this.nome_hotel = props.nome_hotel
    this.nome_fantasia = props.nome_fantasia
    this.razao_social = props.razao_social
    this.cnpj = props.cnpj
    this.email_comercial = props.email_comercial
    this.telefone_comercial = props.telefone_comercial
    this.celular = props.celular ?? null
    this.website = props.website ?? null
    this.status = props.status ?? 'S'

    this.categoria = props.categoria ?? 'HOTEL'
    this.classificacao_estrelas = props.classificacao_estrelas ?? 0
    this.descricao_curta = props.descricao_curta ?? null
    this.descricao_completa = props.descricao_completa ?? null

    this.limite_idade_crianca_gratis = props.limite_idade_crianca_gratis ?? 5
    this.quantidade_max_criancas_gratis =
      props.quantidade_max_criancas_gratis ?? 1

    this.horario_checkin = props.horario_checkin ?? '14:00'
    this.horario_checkout = props.horario_checkout ?? '12:00'
    this.recepcao_24h = props.recepcao_24h ?? true
    this.horario_abertura_recepcao = props.recepcao_24h
      ? null
      : (props.horario_abertura_recepcao ?? null)
    this.horario_fechamento_recepcao = props.recepcao_24h
      ? null
      : (props.horario_fechamento_recepcao ?? null)

    this.aceita_pets = props.aceita_pets ?? false
    this.peso_maximo_pet_kg = props.peso_maximo_pet_kg ?? null
    this.permite_fumar = props.permite_fumar ?? false
    this.taxa_higienizacao_fumo = props.taxa_higienizacao_fumo ?? null

    this.tipo_estacionamento = props.tipo_estacionamento ?? 'NAO_POSSUI'
    this.valor_diaria_estacionamento = props.valor_diaria_estacionamento ?? null
    this.estacionamento_reserva_previa =
      props.estacionamento_reserva_previa ?? false
    this.cobertura_estacionamento =
      props.cobertura_estacionamento ?? 'DESCOBERTO'
    this.possui_wifi = props.possui_wifi ?? true
    this.tipo_wifi = props.tipo_wifi ?? 'GRATUITO_TOTAL'
    this.nome_rede_wifi = props.nome_rede_wifi ?? null
    this.senha_rede_wifi = props.senha_rede_wifi ?? null
    this.exibir_wifi_voucher = props.exibir_wifi_voucher ?? true

    this.tema = props.tema ?? null
  }

  static create(props: HotelProps): Hotel {
    return new Hotel(props)
  }
}
