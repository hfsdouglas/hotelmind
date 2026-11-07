export type CategoriaHotel = 'HOTEL' | 'POUSADA' | 'RESORT' | 'HOSTEL' | 'FLAT'

export type TipoEstacionamento =
  | 'GRATUITO'
  | 'PAGO_LOCAL'
  | 'CONVENIADO'
  | 'NAO_POSSUI'

export type CoberturaEstacionamento = 'COBERTO' | 'DESCOBERTO' | 'MISTO'

export type TipoWifi = 'GRATUITO_TOTAL' | 'GRATUITO_AREAS_COMUNS' | 'PAGO'

export interface HotelTemaDTO {
  id: string
  hotel_id: string
  created_at: string
  updated_at: string

  // Logotipos e Ícones
  logo_principal: string | null
  logo_escuro: string | null
  favicon: string | null

  // Paleta de Cores (Theme Tokens em HEX)
  cor_primaria: string
  cor_secundaria: string
  cor_fundo: string
  cor_superficie: string
  cor_texto_principal: string
  cor_texto_secundario: string
  cor_destaque: string
}

export type UpdateHotelTemaInput = Omit<
  HotelTemaDTO,
  'id' | 'hotel_id' | 'created_at' | 'updated_at'
>

export interface HotelConfiguracaoDTO {
  id: string
  created_at: string
  updated_at: string

  // Dados Cadastrais & Contato (model Hotel)
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  celular: string | null
  website: string | null
  categoria: CategoriaHotel
  classificacao_estrelas: number

  // Apresentação & Slogan
  descricao_curta: string | null
  descricao_completa: string | null

  // Políticas de Crianças & Hóspedes
  limite_idade_crianca_gratis: number
  quantidade_max_criancas_gratis: number

  // Horários Operacionais
  horario_checkin: string
  horario_checkout: string
  recepcao_24h: boolean
  horario_abertura_recepcao: string | null
  horario_fechamento_recepcao: string | null

  // Regras da Casa & Pets
  aceita_pets: boolean
  peso_maximo_pet_kg: number | null
  permite_fumar: boolean
  taxa_higienizacao_fumo: number | null

  // Estacionamento & Conectividade
  tipo_estacionamento: TipoEstacionamento
  valor_diaria_estacionamento: number | null
  estacionamento_reserva_previa: boolean
  cobertura_estacionamento: CoberturaEstacionamento
  possui_wifi: boolean
  tipo_wifi: TipoWifi
  nome_rede_wifi: string | null
  senha_rede_wifi: string | null
  exibir_wifi_voucher: boolean

  // Identidade Visual & Tema
  tema: HotelTemaDTO | null
}

export interface UpdateHotelConfiguracaoInput {
  // Dados Cadastrais & Contato
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  celular?: string | null
  website?: string | null
  categoria: CategoriaHotel
  classificacao_estrelas: number

  // Apresentação & Slogan
  descricao_curta?: string | null
  descricao_completa?: string | null

  // Políticas de Crianças & Hóspedes
  limite_idade_crianca_gratis: number
  quantidade_max_criancas_gratis: number

  // Horários Operacionais
  horario_checkin: string
  horario_checkout: string
  recepcao_24h: boolean
  horario_abertura_recepcao?: string | null
  horario_fechamento_recepcao?: string | null

  // Regras da Casa & Pets
  aceita_pets: boolean
  peso_maximo_pet_kg?: number | null
  permite_fumar: boolean
  taxa_higienizacao_fumo?: number | null

  // Estacionamento & Conectividade
  tipo_estacionamento: TipoEstacionamento
  valor_diaria_estacionamento?: number | null
  estacionamento_reserva_previa: boolean
  cobertura_estacionamento: CoberturaEstacionamento
  possui_wifi: boolean
  tipo_wifi: TipoWifi
  nome_rede_wifi?: string | null
  senha_rede_wifi?: string | null
  exibir_wifi_voucher: boolean

  // Identidade Visual & Tema
  tema: UpdateHotelTemaInput
}
