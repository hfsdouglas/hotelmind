import { useQuery } from '@tanstack/react-query'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { quartosService } from '@/api/quartos.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { reservasService } from '@/api/reservas.service'
import { tarifariosService } from '@/api/tarifarios.service'

const OPTIONS_PAGE_LIMIT = 250

interface NovaReservaCriterios {
  checkIn: string
  checkOut: string
  regimeId: string
  totalPessoas: number
  parceiroId: string
  quartoPreferidoId?: string
}

export function useNovaReservaOpcoes({
  checkIn,
  checkOut,
  regimeId,
  totalPessoas,
  parceiroId,
  quartoPreferidoId,
}: NovaReservaCriterios) {
  const {
    data: regimesData,
    isError: erroRegimesQuery,
    isPending: pendenteRegimes,
  } = useQuery({
    queryKey: ['regimes_alimentacao_ativos'],
    queryFn: () =>
      regimesAlimentacaoService.list({
        ativo: true,
        limite: OPTIONS_PAGE_LIMIT,
      }),
  })

  const {
    data: quartosData,
    isError: erroQuartos,
    isPending: pendenteQuartos,
  } = useQuery({
    queryKey: ['quartos', 'para_regimes', 'lista'],
    queryFn: () => quartosService.list({ limite: OPTIONS_PAGE_LIMIT }),
    enabled: Boolean(quartoPreferidoId),
  })

  const categoriaId = quartoPreferidoId
    ? quartosData?.data.find(q => q.id === quartoPreferidoId)?.categoria_id
    : undefined

  const {
    data: tarifariosData,
    isError: erroTarifarios,
    isPending: pendenteTarifarios,
  } = useQuery({
    queryKey: ['tarifarios', 'ativos_da_categoria', categoriaId],
    queryFn: () =>
      tarifariosService.list({
        categoria_quarto_id: categoriaId,
        ativo: true,
        limite: OPTIONS_PAGE_LIMIT,
      }),
    enabled: Boolean(categoriaId),
  })

  const { data: parceirosData } = useQuery({
    queryKey: ['parceiros_comerciais_ativos'],
    queryFn: () =>
      parceirosComerciaisService.list({
        status: 'ativo',
        limite: OPTIONS_PAGE_LIMIT,
      }),
  })

  const podeConsultar = Boolean(
    checkIn && checkOut && checkIn < checkOut && regimeId && totalPessoas >= 1
  )

  const { data: disponiveis = [], isFetching: carregandoDisponibilidade } =
    useQuery({
      queryKey: [
        'reservas_disponibilidade',
        checkIn,
        checkOut,
        regimeId,
        totalPessoas,
        parceiroId,
      ],
      queryFn: () =>
        reservasService.disponibilidade({
          check_in: checkIn,
          check_out: checkOut,
          regime_alimentacao_id: regimeId,
          pessoas: totalPessoas,
          parceiro_id: parceiroId || null,
        }),
      enabled: podeConsultar,
    })

  const todosRegimes = regimesData?.data || []
  const comSuite = Boolean(quartoPreferidoId)
  const erroRegimes =
    erroRegimesQuery || (comSuite && (erroQuartos || erroTarifarios))
  const carregandoRegimes =
    !erroRegimes &&
    (pendenteRegimes ||
      (comSuite &&
        (pendenteQuartos || (Boolean(categoriaId) && pendenteTarifarios))))

  let regimes = todosRegimes
  if (carregandoRegimes || erroRegimes) {
    regimes = []
  } else if (comSuite && categoriaId) {
    const ids = new Set(
      (tarifariosData?.data ?? []).map(t => t.regime_alimentacao_id)
    )
    regimes = todosRegimes.filter(r => ids.has(r.id))
  }

  return {
    regimes,
    carregandoRegimes,
    erroRegimes,
    parceiros: parceirosData?.data || [],
    disponiveis,
    podeConsultar,
    carregandoDisponibilidade,
  }
}
