import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import type { HotelConfiguracaoRepository } from '@/core/repositories/hotels/hotel_configuracao_repository'

interface GetHotelConfiguracaoInput {
  hotelId: string
}

export class GetHotelConfiguracaoUseCase {
  constructor(private readonly repository: HotelConfiguracaoRepository) {}

  async execute({
    hotelId,
  }: GetHotelConfiguracaoInput): Promise<HotelConfiguracaoDTO> {
    const data = await this.repository.findByHotelId(hotelId)

    if (!data) {
      throw new Error('Hotel não encontrado.')
    }

    return data
  }
}
