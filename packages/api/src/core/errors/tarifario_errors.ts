export class TarifarioNotFoundError extends Error {
  constructor() {
    super('Tarifário não encontrado.')
    this.name = 'TarifarioNotFoundError'
  }
}

export class TarifarioPeriodConflictError extends Error {
  constructor() {
    super(
      'Já existe um tarifário ativo com período sobreposto para esta categoria.',
    )
    this.name = 'TarifarioPeriodConflictError'
  }
}

export class TarifarioValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TarifarioValidationError'
  }
}

export class TarifarioSemCoberturaError extends Error {
  constructor(data: string) {
    super(`Não há tarifário ativo elegível para a noite de ${data}.`)
    this.name = 'TarifarioSemCoberturaError'
  }
}
