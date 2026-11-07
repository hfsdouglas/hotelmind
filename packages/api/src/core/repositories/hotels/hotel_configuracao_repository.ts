import type { UpdateHotelConfiguracaoInput } from '@hotelmind/contracts'
import type { HotelConfiguracao } from '@/core/entities/hotel_configuracao'

export interface HotelConfiguracaoWithHotel {
  configuracao: HotelConfiguracao
  hotel: {
    nome_hotel: string
    nome_fantasia: string
    razao_social: string
    cnpj: string
  }
}

export interface HotelConfiguracaoRepository {
  findByHotelId(hotelId: string): Promise<HotelConfiguracaoWithHotel | null>
  upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoWithHotel>
}
