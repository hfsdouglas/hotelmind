export class QuartoConflictError extends Error {
  constructor() {
    super('Já existe um quarto com esta identificação.')
    this.name = 'QuartoConflictError'
  }
}

export class QuartoNotFoundError extends Error {
  constructor() {
    super('Quarto não encontrado.')
    this.name = 'QuartoNotFoundError'
  }
}

export class CategoriaQuartoInativaError extends Error {
  constructor() {
    super('A categoria selecionada está inativa ou não existe.')
    this.name = 'CategoriaQuartoInativaError'
  }
}
