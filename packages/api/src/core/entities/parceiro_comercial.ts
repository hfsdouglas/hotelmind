import type {
  ModeloTarifario,
  ParceiroContatoItem,
  PoliticaFaturamento,
  StatusParceiro,
  TipoParceiro,
  TipoPessoa,
} from '@hotelmind/contracts'
import { ParceiroComercialValidationError } from '@/core/errors/parceiro_comercial_errors'

export function validar_cpf(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, '')
  if (limpo.length !== 11) return false
  if (/^(\d)\1{10}$/.test(limpo)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(limpo.charAt(i), 10) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(limpo.charAt(9), 10)) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(limpo.charAt(i), 10) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === Number.parseInt(limpo.charAt(10), 10)
}

export function validar_cnpj(cnpj: string): boolean {
  const limpo = cnpj.replace(/\D/g, '')
  if (limpo.length !== 14) return false
  if (/^(\d)\1{13}$/.test(limpo)) return false

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += Number.parseInt(limpo.charAt(i), 10) * pesos1[i]
  }
  let resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto
  if (digito1 !== Number.parseInt(limpo.charAt(12), 10)) return false

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += Number.parseInt(limpo.charAt(i), 10) * pesos2[i]
  }
  resto = soma % 11
  const digito2 = resto < 2 ? 0 : 11 - resto
  return digito2 === Number.parseInt(limpo.charAt(13), 10)
}

export interface ParceiroComercialProps {
  id: string
  hotel_id: string
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia?: string | null
  documento?: string | null
  inscricao_estadual?: string | null
  estrangeiro?: boolean
  cadastur?: string | null
  codigo_iata?: string | null
  registro_embratur?: string | null

  // Endereço
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias: number
  limite_credito: number
  allotment_quartos: number

  // Ciclo de Vida
  status: StatusParceiro
  motivo_bloqueio?: string | null
  observacoes?: string | null
  criado_em: Date
  atualizado_em: Date

  // Relacionamento
  contatos?: ParceiroContatoItem[]
}

export class ParceiroComercial {
  readonly id: string
  readonly hotel_id: string
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia: string | null
  documento: string | null
  inscricao_estadual: string | null
  estrangeiro: boolean
  cadastur: string | null
  codigo_iata: string | null
  registro_embratur: string | null

  // Endereço
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias: number
  limite_credito: number
  allotment_quartos: number

  // Ciclo de Vida
  status: StatusParceiro
  motivo_bloqueio: string | null
  observacoes: string | null
  readonly criado_em: Date
  atualizado_em: Date

  contatos: ParceiroContatoItem[]

  constructor(props: ParceiroComercialProps) {
    this.validar_razao_social(props.razao_social)
    this.validar_regras_comerciais(
      props.comissao_padrao,
      props.limite_credito,
      props.prazo_pagamento_dias,
      props.allotment_quartos
    )
    this.validar_documento(
      props.tipo_pessoa,
      props.documento,
      props.estrangeiro ?? false
    )

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.tipo_parceiro = props.tipo_parceiro
    this.tipo_pessoa = props.tipo_pessoa
    this.razao_social = props.razao_social.trim()
    this.nome_fantasia = props.nome_fantasia?.trim() || null
    this.documento = props.documento ? props.documento.trim() : null
    this.inscricao_estadual = props.inscricao_estadual?.trim() || null
    this.estrangeiro = props.estrangeiro ?? false
    this.cadastur = props.cadastur?.trim() || null
    this.codigo_iata = props.codigo_iata?.trim() || null
    this.registro_embratur = props.registro_embratur?.trim() || null

    this.logradouro = props.logradouro?.trim() || null
    this.numero = props.numero?.trim() || null
    this.complemento = props.complemento?.trim() || null
    this.bairro = props.bairro?.trim() || null
    this.cidade = props.cidade?.trim() || null
    this.estado = props.estado?.trim().toUpperCase() || null
    this.cep = props.cep?.trim() || null
    this.pais = props.pais?.trim() || 'Brasil'

    this.modelo_tarifario = props.modelo_tarifario
    this.comissao_padrao = props.comissao_padrao
    this.politica_faturamento = props.politica_faturamento
    this.prazo_pagamento_dias = props.prazo_pagamento_dias
    this.limite_credito = props.limite_credito
    this.allotment_quartos = props.allotment_quartos

    this.status = props.status
    this.motivo_bloqueio = props.motivo_bloqueio?.trim() || null
    this.observacoes = props.observacoes?.trim() || null
    this.criado_em = props.criado_em
    this.atualizado_em = props.atualizado_em

    this.contatos = props.contatos || []
  }

  private validar_razao_social(razao: string) {
    if (!razao?.trim()) {
      throw new ParceiroComercialValidationError(
        'Razão Social ou Nome Completo é obrigatório.'
      )
    }
    if (razao.trim().length > 150) {
      throw new ParceiroComercialValidationError(
        'Razão Social não pode ter mais de 150 caracteres.'
      )
    }
  }

  private validar_regras_comerciais(
    comissao: number,
    limite: number,
    prazo: number,
    allotment: number
  ) {
    if (comissao < 0 || comissao > 100) {
      throw new ParceiroComercialValidationError(
        'O percentual de comissão deve estar entre 0% e 100%.'
      )
    }
    if (limite < 0) {
      throw new ParceiroComercialValidationError(
        'O limite de crédito não pode ser negativo.'
      )
    }
    if (prazo < 0) {
      throw new ParceiroComercialValidationError(
        'O prazo de pagamento não pode ser negativo.'
      )
    }
    if (allotment < 0) {
      throw new ParceiroComercialValidationError(
        'A cota de allotment não pode ser negativa.'
      )
    }
  }

  private validar_documento(
    tipoPessoa: TipoPessoa,
    documento: string | null | undefined,
    estrangeiro: boolean
  ) {
    if (estrangeiro) {
      return
    }

    if (!documento?.trim()) {
      throw new ParceiroComercialValidationError(
        tipoPessoa === 'PF' ? 'O CPF é obrigatório.' : 'O CNPJ é obrigatório.'
      )
    }

    const limpo = documento.replace(/\D/g, '')
    if (tipoPessoa === 'PF') {
      if (!validar_cpf(limpo)) {
        throw new ParceiroComercialValidationError('CPF inválido.')
      }
    } else {
      if (!validar_cnpj(limpo)) {
        throw new ParceiroComercialValidationError('CNPJ inválido.')
      }
    }
  }

  ativar() {
    this.status = 'ativo'
    this.motivo_bloqueio = null
    this.atualizado_em = new Date()
  }

  inativar() {
    this.status = 'inativo'
    this.atualizado_em = new Date()
  }

  bloquear(motivo: string) {
    if (!motivo?.trim()) {
      throw new ParceiroComercialValidationError(
        'Informe o motivo do bloqueio do parceiro comercial.'
      )
    }
    this.status = 'bloqueado'
    this.motivo_bloqueio = motivo.trim()
    this.atualizado_em = new Date()
  }
}
