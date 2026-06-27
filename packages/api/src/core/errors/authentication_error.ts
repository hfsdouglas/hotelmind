export class UserNotFoundError extends Error {
  readonly code = 'USER_NOT_FOUND'

  constructor() {
    super('Usuário não encontrado')
    this.name = 'UserNotFoundError'
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = 'INVALID_CREDENTIALS'

  constructor() {
    super('Credenciais inválidas')
    this.name = 'InvalidCredentialsError'
  }
}
