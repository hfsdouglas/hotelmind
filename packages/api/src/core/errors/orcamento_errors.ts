export class OrcamentoNotFoundError extends Error {
  constructor(message = 'Orçamento não encontrado.') {
    super(message)
    this.name = 'OrcamentoNotFoundError'
  }
}

export class OrcamentoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrcamentoValidationError'
  }
}
