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
  params: ConsultarCalendarioTarifariosParams & {
    categoria_quarto_ids?: string[]
  }
) {
  const category_ids =
    params.categoria_quarto_ids && params.categoria_quarto_ids.length > 0
      ? params.categoria_quarto_ids
      : params.categoria_quarto_id
        ? [params.categoria_quarto_id]
        : []

  return useQuery({
    queryKey: ['tarifarios_calendario', params],
    queryFn: async () => {
      if (category_ids.length <= 1) {
        return tarifariosService.calendar({
          categoria_quarto_id: category_ids[0] ?? '',
          parceiro_id: params.parceiro_id,
          data_inicio: params.data_inicio,
          data_fim: params.data_fim,
        })
      }
      const results = await Promise.all(
        category_ids.map(cat_id =>
          tarifariosService.calendar({
            categoria_quarto_id: cat_id,
            parceiro_id: params.parceiro_id,
            data_inicio: params.data_inicio,
            data_fim: params.data_fim,
          })
        )
      )
      const by_id = new Map<string, (typeof results)[0]['data'][0]>()
      for (const res of results) {
        for (const item of res.data) {
          if (!by_id.has(item.id)) {
            by_id.set(item.id, item)
          }
        }
      }
      return { data: Array.from(by_id.values()) }
    },
    enabled: category_ids.length > 0,
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
