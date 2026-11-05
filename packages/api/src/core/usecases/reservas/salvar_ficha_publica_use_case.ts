import type { FichaStatus, SaveFichaPayload } from '@hotelmind/contracts'
import type { ReservaHospede } from '@/core/entities/reserva_hospede'
import {
  FnrhLinkInvalidoError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type {
  IReservaHospedeRepository,
  IReservaRepository,
} from '@/core/repositories/reservas/reserva_repository'
import { FnrhValidationService } from '@/core/services/fnrh_validation_service'
import { ReservaStatusService } from '@/core/services/reserva_status_service'

export interface SalvarFichaPublicaInput {
  token: string
  posicao: number
  dados: SaveFichaPayload
}

export class SalvarFichaPublicaUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hospedes_repo: IReservaHospedeRepository,
    private readonly validation_service: FnrhValidationService = new FnrhValidationService(),
    private readonly status_service: ReservaStatusService = new ReservaStatusService()
  ) {}

  async execute(input: SalvarFichaPublicaInput): Promise<ReservaHospede> {
    const { token, posicao, dados } = input

    const reserva = await this.reservas_repo.find_by_token_fnrh(token)
    if (!reserva?.token_fnrh_ativo) {
      throw new FnrhLinkInvalidoError()
    }

    if (!this.status_service.permite_link_publico(reserva.status)) {
      throw new FnrhLinkInvalidoError()
    }

    const hoje = new Date().toISOString().slice(0, 10)
    if (hoje > reserva.check_out) {
      throw new FnrhLinkInvalidoError()
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

    const updated = await this.hospedes_repo.update_ficha(reserva.id, posicao, {
      ...dados,
      ficha_status: status_ficha,
      preenchido_por: 'cliente',
      preenchido_em: new Date(),
    })

    if (!updated) {
      throw new ReservaValidationError('Hóspede não encontrado.')
    }

    return updated
  }
}
