export type ReservaStatus =
  | 'a_confirmar'
  | 'confirmada'
  | 'check_in'
  | 'check_out'
  | 'no_show'
  | 'cancelada'

export type FichaStatus = 'pendente' | 'rascunho' | 'preenchida'
export type FichaPreenchidaPor = 'cliente' | 'hotel'

export interface FichaFnrh {
  nome_completo: string | null
  nacionalidade: string | null
  data_nascimento: string | null // YYYY-MM-DD
  sexo: string | null
  profissao: string | null
  tipo_documento: 'cpf' | 'rg' | 'passaporte' | 'outro' | null
  numero_documento: string | null
  logradouro: string | null
  numero_endereco: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais_residencia: string | null
  telefone: string | null
  email: string | null
  motivo_viagem: string | null
  meio_transporte: string | null
  procedencia: string | null
  proximo_destino: string | null
  responsavel_posicao: number | null
}

export interface ReservaHospede extends FichaFnrh {
  id: string
  posicao: number
  ficha_status: FichaStatus
  preenchido_por: FichaPreenchidaPor | null
  preenchido_em: string | null
}

export interface DiariaReserva {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export interface Reserva {
  id: string
  hotel_id: string
  codigo: string
  titular_nome: string
  titular_telefone: string | null
  titular_email: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_comercial_id: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas: number
  valor_total: string
  detalhamento_diarias: DiariaReserva[]
  status: ReservaStatus
  token_fnrh: string
  token_fnrh_ativo: boolean
  fnrh_enviada_em: string | null
  fichas_preenchidas: number
  total_hospedes: number
  quantidade_pets?: number
  cupom_desconto?: string | null
  observacoes: string | null
  quarto?: { id: string; identificacao: string; categoria_nome: string }
  regime_alimentacao?: { id: string; titulo: string; cor_pulseira: string }
  parceiro_comercial?: { id: string; razao_social: string } | null
  hospedes?: ReservaHospede[]
  criado_em: string
  atualizado_em: string
}

export interface CreateReservaPayload {
  titular_nome: string
  titular_telefone?: string | null
  titular_email?: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_comercial_id?: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  quantidade_pets?: number
  cupom_desconto?: string | null
  observacoes?: string | null
}

export type UpdateReservaPayload = Partial<CreateReservaPayload> & {
  status?: ReservaStatus
}

export interface ReservaListParams {
  pagina?: number
  limite?: number
  busca?: string // código ou nome do titular/hóspede
  status?: ReservaStatus
  check_in_de?: string
  check_in_ate?: string
  quarto_id?: string
  regime_alimentacao_id?: string
  parceiro_comercial_id?: string
}

export interface ReservaListResponse {
  data: Reserva[]
  meta: {
    total: number
    pagina: number
    limite: number
    ultima_pagina: number
    total_paginas?: number
  }
}

export interface ChangeReservaStatusPayload {
  status: ReservaStatus
}

export interface QuartoDisponivel {
  quarto_id: string
  identificacao: string
  categoria_id?: string
  categoria_nome: string
  limite_hospedes: number
  valor_total: string
}

export interface ReservaConflitoErro {
  message: string
  alternativas: QuartoDisponivel[]
}

export interface FnrhLinkInfo {
  url_token: string
  ativo: boolean
}

// Página pública (token)
export interface FnrhPublicaView {
  hotel_nome: string
  titular_nome: string
  check_in: string
  check_out: string
  quarto_identificacao: string
  total_hospedes: number
  fnrh_enviada_em: string | null
  hospedes: ReservaHospede[]
}

export type SaveFichaPayload = Partial<FichaFnrh> & { concluir?: boolean }
