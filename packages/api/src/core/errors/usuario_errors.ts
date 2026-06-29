export class UsuarioNotFoundError extends Error {
  constructor() {
    super('Usuário não encontrado.')
    this.name = 'UsuarioNotFoundError'
  }
}

export class UsuarioConflictError extends Error {
  constructor(message = 'Já existe um usuário com este e-mail, CPF ou celular.') {
    super(message)
    this.name = 'UsuarioConflictError'
  }
}
