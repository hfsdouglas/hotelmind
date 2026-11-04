import type { Orcamento } from '@/core/entities/orcamento'
import type {
  IOrcamentoRepository,
  OrcamentoListFilter,
} from '@/core/repositories/orcamentos/orcamento_repository'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface ListarOrcamentosInput extends OrcamentoListFilter {
  hotel_id: string
}

export class ListarOrcamentosUseCase {
  constructor(private readonly orcamentos: IOrcamentoRepository) {}

  async execute(
    input: ListarOrcamentosInput
  ): Promise<PaginatedResult<Orcamento>> {
    return this.orcamentos.list(input.hotel_id, {
      pagina: input.pagina,
      limite: input.limite,
      busca: input.busca,
      regime_alimentacao_id: input.regime_alimentacao_id,
      categoria_quarto_id: input.categoria_quarto_id,
      status: input.status,
      data_inicio: input.data_inicio,
      data_fim: input.data_fim,
    })
  }
}
