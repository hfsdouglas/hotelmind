import type { UpdateHotelConfiguracaoInput } from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hotelConfiguracaoService } from '@/api/hotel_configuracao.service'

export function useHotelConfiguracao() {
  return useQuery({
    queryKey: ['hotel-configuracao'],
    queryFn: () => hotelConfiguracaoService.get(),
  })
}

export function useUpdateHotelConfiguracaoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateHotelConfiguracaoInput) =>
      hotelConfiguracaoService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-configuracao'] })
    },
  })
}
