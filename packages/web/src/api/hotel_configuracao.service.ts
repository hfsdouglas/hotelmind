import type {
  HotelConfiguracaoDTO,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const hotelConfiguracaoService = {
  get: () =>
    api.get<HotelConfiguracaoDTO>('/hoteis/configuracao').then(r => r.data),
  update: (data: UpdateHotelConfiguracaoInput) =>
    api
      .put<HotelConfiguracaoDTO>('/hoteis/configuracao', data)
      .then(r => r.data),
}
