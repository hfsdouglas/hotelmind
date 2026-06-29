export class GrupoNotFoundError extends Error {
  constructor() {
    super('Grupo não encontrado.')
    this.name = 'GrupoNotFoundError'
  }
}
