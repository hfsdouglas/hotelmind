import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'

export interface ListarRegimesAlimentacaoInput {
  hotel_id: string
  pagina?: number
  limite?: number
  busca?: string
  ativo?: boolean
}

export class ListarRegimesAlimentacaoUseCase {
  constructor(private readonly repository: IRegimeAlimentacaoRepository) {}

  async execute(input: ListarRegimesAlimentacaoInput) {
    const pagina = Math.max(1, input.pagina ?? 1)
    const limite = Math.min(100, Math.max(1, input.limite ?? 10))

    return await this.repository.list(input.hotel_id, {
      pagina,
      limite,
      busca: input.busca,
      ativo: input.ativo,
    })
  }
}
