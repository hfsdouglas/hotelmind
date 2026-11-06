import type { FnrhPublicaView } from '@hotelmind/contracts'
import { FnrhLinkInvalidoError } from '@/core/errors/reserva_errors'
import type { IHotelRepository } from '@/core/repositories/hotels/hotel.repository'
import type { IReservaRepository } from '@/core/repositories/reservas/reserva_repository'
import { ReservaStatusService } from '@/core/services/reserva_status_service'

export class BuscarFnrhPublicaUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hotels_repo?: IHotelRepository,
    private readonly status_service: ReservaStatusService = new ReservaStatusService()
  ) {}

  async execute(token: string): Promise<FnrhPublicaView> {
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

    let hotel_nome = 'Hotel'
    if (this.hotels_repo) {
      const hotel = await this.hotels_repo.findById(reserva.hotel_id)
      if (hotel) {
        hotel_nome = hotel.nome_fantasia || hotel.razao_social || 'Hotel'
      }
    }

    return {
      hotel_nome,
      titular_nome: reserva.titular_nome,
      check_in: reserva.check_in,
      check_out: reserva.check_out,
      quarto_identificacao: reserva.quarto?.identificacao ?? '',
      total_hospedes: reserva.total_hospedes,
      fnrh_enviada_em: reserva.fnrh_enviada_em
        ? reserva.fnrh_enviada_em.toISOString()
        : null,
      hospedes: (reserva.hospedes || []).map(h => ({
        id: h.id,
        posicao: h.posicao,
        ficha_status: h.ficha_status,
        preenchido_por: h.preenchido_por,
        preenchido_em: h.preenchido_em ? h.preenchido_em.toISOString() : null,
        nome_completo: h.nome_completo,
        nacionalidade: h.nacionalidade,
        data_nascimento: h.data_nascimento,
        sexo: h.sexo,
        profissao: h.profissao,
        tipo_documento: h.tipo_documento,
        numero_documento: h.numero_documento,
        logradouro: h.logradouro,
        numero_endereco: h.numero_endereco,
        complemento: h.complemento,
        bairro: h.bairro,
        cidade: h.cidade,
        estado: h.estado,
        cep: h.cep,
        pais_residencia: h.pais_residencia,
        telefone: h.telefone,
        email: h.email,
        motivo_viagem: h.motivo_viagem,
        meio_transporte: h.meio_transporte,
        responsavel_posicao: h.responsavel_posicao,
      })),
    }
  }
}
