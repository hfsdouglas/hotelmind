import type {
  HotelConfiguracaoDTO,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'
import { HotelTema } from '@/core/entities/hotel_tema'
import type { HotelConfiguracaoRepository } from '@/core/repositories/hotels/hotel_configuracao_repository'

interface UpdateHotelConfiguracaoUseCaseInput {
  hotelId: string
  data: UpdateHotelConfiguracaoInput
}

export class UpdateHotelConfiguracaoUseCase {
  constructor(private readonly repository: HotelConfiguracaoRepository) {}

  async execute({
    hotelId,
    data,
  }: UpdateHotelConfiguracaoUseCaseInput): Promise<HotelConfiguracaoDTO> {
    const existing = await this.repository.findByHotelId(hotelId)
    if (!existing) {
      throw new Error('Hotel não encontrado.')
    }

    if (data.recepcao_24h === false) {
      if (
        !data.horario_abertura_recepcao ||
        !data.horario_fechamento_recepcao
      ) {
        throw new Error(
          'Horários de abertura e fechamento da recepção são obrigatórios quando o funcionamento não for 24 horas.'
        )
      }
    }

    // Valida tokens de cor HEX do tema
    HotelTema.create({
      id: existing.tema?.id ?? 'temp-id',
      hotel_id: hotelId,
      logo_principal: data.tema.logo_principal,
      logo_escuro: data.tema.logo_escuro,
      favicon: data.tema.favicon,
      cor_primaria: data.tema.cor_primaria,
      cor_secundaria: data.tema.cor_secundaria,
      cor_fundo: data.tema.cor_fundo,
      cor_superficie: data.tema.cor_superficie,
      cor_texto_principal: data.tema.cor_texto_principal,
      cor_texto_secundario: data.tema.cor_texto_secundario,
      cor_destaque: data.tema.cor_destaque,
    })

    return this.repository.upsert(hotelId, data)
  }
}
