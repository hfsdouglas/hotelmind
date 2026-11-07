import type {
  HotelConfiguracaoDTO,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'

export interface HotelConfiguracaoRepository {
  findByHotelId(hotelId: string): Promise<HotelConfiguracaoDTO | null>
  upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoDTO>
}
