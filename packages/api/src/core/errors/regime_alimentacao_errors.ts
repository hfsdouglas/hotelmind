export class RegimeAlimentacaoNotFoundError extends Error {
  constructor(message = 'Regime de alimentação não encontrado.') {
    super(message)
    this.name = 'RegimeAlimentacaoNotFoundError'
  }
}

export class RegimeAlimentacaoConflictError extends Error {
  constructor(
    message = 'Já existe um regime de alimentação cadastrado com este título.'
  ) {
    super(message)
    this.name = 'RegimeAlimentacaoConflictError'
  }
}

export class RegimeAlimentacaoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RegimeAlimentacaoValidationError'
  }
}
