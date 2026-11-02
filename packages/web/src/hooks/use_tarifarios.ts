import type {
  ConsultarCalendarioTarifariosParams,
  CreateTarifarioPayload,
  TarifarioListParams,
  UpdateTarifarioPayload,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tarifariosService } from '@/api/tarifarios.service'

export function useTarifariosList(params?: TarifarioListParams) {
  return useQuery({
    queryKey: ['tarifarios', params],
    queryFn: () => tarifariosService.list(params),
  })
}

export function useTarifario(id: string) {
  return useQuery({
    queryKey: ['tarifario', id],
    queryFn: () => tarifariosService.get(id),
    enabled: Boolean(id),
  })
}

export function useTarifariosCalendario(
  params: ConsultarCalendarioTarifariosParams,
) {
  return useQuery({
    queryKey: ['tarifarios_calendario', params],
    queryFn: () => tarifariosService.calendar(params),
    enabled: Boolean(params.categoria_quarto_id),
  })
}

export function useCreateTarifarioMutation() {
  const query_client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTarifarioPayload) =>
      tarifariosService.create(payload),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['tarifarios'] })
      query_client.invalidateQueries({ queryKey: ['tarifarios_calendario'] })
    },
  })
}

export function useUpdateTarifarioMutation(id: string) {
  const query_client = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTarifarioPayload) =>
      tarifariosService.update(id, payload),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['tarifarios'] })
      query_client.invalidateQueries({ queryKey: ['tarifario', id] })
      query_client.invalidateQueries({ queryKey: ['tarifarios_calendario'] })
    },
  })
}

export function useActivateTarifarioMutation() {
  const query_client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tarifariosService.activate(id),
    onSuccess: (_, id) => {
      query_client.invalidateQueries({ queryKey: ['tarifarios'] })
      query_client.invalidateQueries({ queryKey: ['tarifario', id] })
      query_client.invalidateQueries({ queryKey: ['tarifarios_calendario'] })
    },
  })
}

export function useDeactivateTarifarioMutation() {
  const query_client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tarifariosService.deactivate(id),
    onSuccess: (_, id) => {
      query_client.invalidateQueries({ queryKey: ['tarifarios'] })
      query_client.invalidateQueries({ queryKey: ['tarifario', id] })
      query_client.invalidateQueries({ queryKey: ['tarifarios_calendario'] })
    },
  })
}
