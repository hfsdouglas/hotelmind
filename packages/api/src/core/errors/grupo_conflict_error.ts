export class GrupoConflictError extends Error {
  constructor(message = 'Já existe um grupo com este nome neste hotel.') {
    super(message)
    this.name = 'GrupoConflictError'
  }
}

export class GrupoLinkedUsersError extends Error {
  constructor() {
    super('Este grupo possui usuários vinculados e não pode ser excluído.')
    this.name = 'GrupoLinkedUsersError'
  }
}
