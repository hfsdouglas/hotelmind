export class ParceiroComercialNotFoundError extends Error {
  constructor(message = 'Parceiro comercial não encontrado.') {
    super(message)
    this.name = 'ParceiroComercialNotFoundError'
  }
}

export class ParceiroComercialConflictError extends Error {
  constructor(
    message = 'Já existe um parceiro comercial cadastrado com este documento.'
  ) {
    super(message)
    this.name = 'ParceiroComercialConflictError'
  }
}

export class ParceiroComercialValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParceiroComercialValidationError'
  }
}
