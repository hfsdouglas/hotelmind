export class LeadNotFoundError extends Error {
  constructor(message = 'Lead não encontrado.') {
    super(message)
    this.name = 'LeadNotFoundError'
  }
}

export class LeadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeadValidationError'
  }
}
