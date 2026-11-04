import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  IParceiroComercialRepository,
  ParceiroComercialListFilter,
} from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface ListarParceirosComerciaisInput
  extends ParceiroComercialListFilter {
  hotel_id: string
}

export class ListarParceirosComerciaisUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(
    input: ListarParceirosComerciaisInput
  ): Promise<PaginatedResult<ParceiroComercial>> {
    return this.repo.list(input.hotel_id, {
      pagina: input.pagina,
      limite: input.limite,
      busca: input.busca,
      tipo_parceiro: input.tipo_parceiro,
      status: input.status,
      cidade: input.cidade,
      estado: input.estado,
    })
  }
}
