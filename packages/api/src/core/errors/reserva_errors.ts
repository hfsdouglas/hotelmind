import type { QuartoDisponivel } from '@hotelmind/contracts'

export class ReservaNotFoundError extends Error {
  constructor(message = 'Reserva não encontrada.') {
    super(message)
    this.name = 'ReservaNotFoundError'
  }
}

export class ReservaValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReservaValidationError'
  }
}

export class ReservaConflitoError extends Error {
  readonly alternativas: QuartoDisponivel[]

  constructor(
    message = 'A suíte selecionada já possui reserva no período informado.',
    alternativas: QuartoDisponivel[] = []
  ) {
    super(message)
    this.name = 'ReservaConflitoError'
    this.alternativas = alternativas
  }
}

export class ReservaTransicaoInvalidaError extends Error {
  constructor(status_atual: string, status_novo: string) {
    super(
      `Não é permitida a transição de status de '${status_atual}' para '${status_novo}'.`
    )
    this.name = 'ReservaTransicaoInvalidaError'
  }
}

export class FnrhLinkInvalidoError extends Error {
  constructor(message = 'Link de preenchimento da FNRH inválido ou expirado.') {
    super(message)
    this.name = 'FnrhLinkInvalidoError'
  }
}
