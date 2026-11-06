import type { FichaPreenchidaPor, FichaStatus } from '@hotelmind/contracts'
import { ReservaValidationError } from '@/core/errors/reserva_errors'

export interface ReservaHospedeProps {
  id: string
  reserva_id: string
  posicao: number
  ficha_status?: FichaStatus
  preenchido_por?: FichaPreenchidaPor | null
  preenchido_em?: Date | string | null

  nome_completo?: string | null
  nacionalidade?: string | null
  data_nascimento?: Date | string | null
  sexo?: string | null
  profissao?: string | null
  tipo_documento?: 'cpf' | 'rg' | 'passaporte' | 'outro' | null
  numero_documento?: string | null
  logradouro?: string | null
  numero_endereco?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais_residencia?: string | null
  telefone?: string | null
  email?: string | null
  motivo_viagem?: string | null
  meio_transporte?: string | null
  responsavel_posicao?: number | null
}

export class ReservaHospede {
  readonly id: string
  readonly reserva_id: string
  readonly posicao: number
  readonly ficha_status: FichaStatus
  readonly preenchido_por: FichaPreenchidaPor | null
  readonly preenchido_em: Date | null

  readonly nome_completo: string | null
  readonly nacionalidade: string | null
  readonly data_nascimento: string | null
  readonly sexo: string | null
  readonly profissao: string | null
  readonly tipo_documento: 'cpf' | 'rg' | 'passaporte' | 'outro' | null
  readonly numero_documento: string | null
  readonly logradouro: string | null
  readonly numero_endereco: string | null
  readonly complemento: string | null
  readonly bairro: string | null
  readonly cidade: string | null
  readonly estado: string | null
  readonly cep: string | null
  readonly pais_residencia: string | null
  readonly telefone: string | null
  readonly email: string | null
  readonly motivo_viagem: string | null
  readonly meio_transporte: string | null
  readonly responsavel_posicao: number | null

  constructor(props: ReservaHospedeProps) {
    if (!props.reserva_id) {
      throw new ReservaValidationError('O id da reserva é obrigatório.')
    }
    if (!props.posicao || props.posicao < 1) {
      throw new ReservaValidationError(
        'A posição do hóspede deve ser maior ou igual a 1.'
      )
    }

    let nasc_str: string | null = null
    if (props.data_nascimento) {
      if (props.data_nascimento instanceof Date) {
        nasc_str = props.data_nascimento.toISOString().slice(0, 10)
      } else {
        nasc_str = props.data_nascimento.slice(0, 10)
      }
    }

    this.id = props.id
    this.reserva_id = props.reserva_id
    this.posicao = props.posicao
    this.ficha_status = props.ficha_status || 'pendente'
    this.preenchido_por = props.preenchido_por || null
    this.preenchido_em = props.preenchido_em
      ? new Date(props.preenchido_em)
      : null

    this.nome_completo = props.nome_completo?.trim() || null
    this.nacionalidade = props.nacionalidade?.trim() || null
    this.data_nascimento = nasc_str
    this.sexo = props.sexo?.trim() || null
    this.profissao = props.profissao?.trim() || null
    this.tipo_documento = props.tipo_documento || null
    this.numero_documento = props.numero_documento?.trim() || null
    this.logradouro = props.logradouro?.trim() || null
    this.numero_endereco = props.numero_endereco?.trim() || null
    this.complemento = props.complemento?.trim() || null
    this.bairro = props.bairro?.trim() || null
    this.cidade = props.cidade?.trim() || null
    this.estado = props.estado?.trim().toUpperCase() || null
    this.cep = props.cep?.replace(/\D/g, '') || null
    this.pais_residencia = props.pais_residencia?.trim() || null
    this.telefone = props.telefone?.trim() || null
    this.email = props.email?.trim() || null
    this.motivo_viagem = props.motivo_viagem?.trim() || null
    this.meio_transporte = props.meio_transporte?.trim() || null
    this.responsavel_posicao = props.responsavel_posicao ?? null
  }

  get is_titular(): boolean {
    return this.posicao === 1
  }
}
