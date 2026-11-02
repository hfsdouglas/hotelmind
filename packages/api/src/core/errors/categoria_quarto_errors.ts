export class CategoriaQuartoConflictError extends Error {
  constructor() {
    super('Já existe uma categoria com este nome.')
    this.name = 'CategoriaQuartoConflictError'
  }
}

export class CategoriaQuartoNotFoundError extends Error {
  constructor() {
    super('Categoria de quarto não encontrada.')
    this.name = 'CategoriaQuartoNotFoundError'
  }
}
