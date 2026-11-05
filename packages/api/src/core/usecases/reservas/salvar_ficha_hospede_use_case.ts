import type { FichaStatus, SaveFichaPayload } from '@hotelmind/contracts'
import type { ReservaHospede } from '@/core/entities/reserva_hospede'
import {
  ReservaNotFoundError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type {
  IReservaHospedeRepository,
  IReservaRepository,
} from '@/core/repositories/reservas/reserva_repository'
import { FnrhValidationService } from '@/core/services/fnrh_validation_service'

export interface SalvarFichaHospedeInput {
  reserva_id: string
  hotel_id: string
  posicao: number
  dados: SaveFichaPayload
}

export class SalvarFichaHospedeUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hospedes_repo: IReservaHospedeRepository,
    private readonly validation_service: FnrhValidationService = new FnrhValidationService()
  ) {}

  async execute(input: SalvarFichaHospedeInput): Promise<ReservaHospede> {
    const { reserva_id, hotel_id, posicao, dados } = input

    const reserva = await this.reservas_repo.find_by_id(reserva_id, hotel_id)
    if (!reserva) {
      throw new ReservaNotFoundError()
    }

    if (posicao < 1 || posicao > reserva.total_hospedes) {
      throw new ReservaValidationError(
        `Posição de hóspede inválida. A reserva possui ${reserva.total_hospedes} hóspede(s).`
      )
    }

    let status_ficha: FichaStatus = 'rascunho'
    if (dados.concluir) {
      this.validation_service.validar_e_lancar(dados)
      status_ficha = 'preenchida'
    }

    const updated = await this.hospedes_repo.update_ficha(reserva_id, posicao, {
      ...dados,
      ficha_status: status_ficha,
      preenchido_por: 'hotel',
      preenchido_em: new Date(),
    })

    if (!updated) {
      throw new ReservaValidationError('Hóspede não encontrado.')
    }

    return updated
  }
}
