import { RegimeAlimentacaoValidationError } from '@/core/errors/regime_alimentacao_errors'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export interface RegimeAlimentacaoProps {
  id: string
  hotel_id: string
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo: boolean
  criado_em: Date
  atualizado_em: Date
}

export class RegimeAlimentacao {
  readonly id: string
  readonly hotel_id: string
  titulo: string
  descricao: string | null
  cor_pulseira: string
  ativo: boolean
  readonly criado_em: Date
  atualizado_em: Date

  constructor(props: RegimeAlimentacaoProps) {
    this.validar_titulo(props.titulo)
    this.validar_cor_pulseira(props.cor_pulseira)

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.titulo = props.titulo.trim()
    this.descricao = props.descricao?.trim() ? props.descricao.trim() : null
    this.cor_pulseira = props.cor_pulseira.trim().toUpperCase()
    this.ativo = props.ativo
    this.criado_em = props.criado_em
    this.atualizado_em = props.atualizado_em
  }

  private validar_titulo(titulo: string) {
    if (!titulo?.trim()) {
      throw new RegimeAlimentacaoValidationError('O título é obrigatório.')
    }
    if (titulo.trim().length > 100) {
      throw new RegimeAlimentacaoValidationError(
        'O título não pode ter mais de 100 caracteres.'
      )
    }
  }

  private validar_cor_pulseira(cor: string) {
    if (!cor?.trim()) {
      throw new RegimeAlimentacaoValidationError(
        'A cor da pulseira é obrigatória.'
      )
    }
    const trimmed = cor.trim()
    if (!HEX_COLOR_REGEX.test(trimmed)) {
      throw new RegimeAlimentacaoValidationError(
        'A cor da pulseira deve ser um código hexadecimal válido (ex: #FF5733).'
      )
    }
  }

  ativar() {
    this.ativo = true
    this.atualizado_em = new Date()
  }

  desativar() {
    this.ativo = false
    this.atualizado_em = new Date()
  }
}
