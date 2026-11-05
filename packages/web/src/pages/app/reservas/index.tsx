import type { Reserva, ReservaStatus } from '@hotelmind/contracts'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Eye, Handshake, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { reservasService } from '@/api/reservas.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mask_phone } from '@/hooks/use_phone_mask'
import { usePaginacao } from '@/hooks/usePaginacao'

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
  const dateOnly = dataIso.split('T')[0]
  const [ano, mes, dia] = dateOnly.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

function getStatusBadge(status: ReservaStatus) {
  switch (status) {
    case 'a_confirmar':
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
        >
          A Confirmar
        </Badge>
      )
    case 'confirmada':
      return (
        <Badge
          variant="outline"
          className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300"
        >
          Confirmada
        </Badge>
      )
    case 'check_in':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Check-in
        </Badge>
      )
    case 'check_out':
      return (
        <Badge
          variant="outline"
          className="bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Check-out
        </Badge>
      )
    case 'no_show':
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
        >
          No-show
        </Badge>
      )
    case 'cancelada':
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Cancelada
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ReservasPage() {
  const navigate = useNavigate()
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()

  const { data: parceirosData } = useQuery({
    queryKey: ['parceiros_comerciais_ativos'],
    queryFn: () => parceirosComerciaisService.list({ status: 'ativo' }),
  })
  const parceiros = parceirosData?.data || []

  const [searchParams] = useSearchParams()
  const statusFiltro =
    (searchParams.get('status') as ReservaStatus) || undefined
  const parceiroFiltro = searchParams.get('parceiro_id') || undefined

  const colunas: Column<Reserva>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'Código',
        render: r => (
          <div className="flex flex-col">
            <Link
              to={`/reservas/${r.id}`}
              className="font-mono font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {r.codigo}
            </Link>
            <span className="text-[11px] text-zinc-400">
              {formatarDataBR(r.criado_em)}
            </span>
          </div>
        ),
      },
      {
        key: 'titular',
        header: 'Titular / Hóspedes',
        render: r => (
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {r.titular_nome}
            </span>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {r.titular_telefone && (
                <span>{mask_phone(r.titular_telefone)}</span>
              )}
              {r.parceiro_comercial && (
                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                  <Handshake className="size-3" />
                  {r.parceiro_comercial.razao_social}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'periodo',
        header: 'Período',
        render: r => (
          <div className="text-xs space-y-0.5">
            <div>
              <span className="text-zinc-400">In:</span>{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {formatarDataBR(r.check_in)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400">Out:</span>{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {formatarDataBR(r.check_out)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'quarto',
        header: 'Acomodação',
        render: r => (
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Suíte {r.quarto?.identificacao || '-'}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor: r.regime_alimentacao?.cor_pulseira || '#999',
                }}
              />
              <span className="text-zinc-500 truncate max-w-[120px]">
                {r.regime_alimentacao?.titulo}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'fnrh',
        header: 'FNRH',
        render: r => {
          const completa = r.fichas_preenchidas === r.total_hospedes
          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge
                variant="outline"
                className={`text-xs ${
                  completa
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {r.fichas_preenchidas} de {r.total_hospedes} preenchida(s)
              </Badge>
              {r.fnrh_enviada_em && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="size-2.5" />
                  Enviada pelo cliente
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'valor_total',
        header: 'Valor Total',
        render: r => (
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            {formatarMoeda(r.valor_total)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: r => getStatusBadge(r.status),
      },
      {
        key: 'acoes',
        header: 'Ações',
        render: r => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
              title="Ver detalhes da reserva"
            >
              <Link to={`/reservas/${r.id}`}>
                <Eye className="size-4 text-zinc-600 hover:text-zinc-900" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <ListPageLayout
      title="Gestão de Reservas"
      action={
        <Button
          onClick={() => navigate('/reservas/nova')}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="size-4" />
          Nova Reserva
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              defaultValue={busca}
              onChange={val => {
                setParam('busca', val)
                setPagina(1)
              }}
              placeholder="Buscar por código ou nome do hóspede..."
              isPending={isPending}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro de Status */}
            <select
              value={statusFiltro || ''}
              onChange={e => {
                setParam('status', e.target.value)
                setPagina(1)
              }}
              className="text-xs px-2.5 py-2 border rounded-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            >
              <option value="">Todos os status</option>
              <option value="a_confirmar">A Confirmar</option>
              <option value="confirmada">Confirmada</option>
              <option value="check_in">Check-in</option>
              <option value="check_out">Check-out</option>
              <option value="no_show">No-show</option>
              <option value="cancelada">Cancelada</option>
            </select>

            {/* Filtro de Parceiro */}
            <select
              value={parceiroFiltro || ''}
              onChange={e => {
                setParam('parceiro_id', e.target.value)
                setPagina(1)
              }}
              className="text-xs px-2.5 py-2 border rounded-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            >
              <option value="">Todos os parceiros</option>
              {parceiros.map(p => (
                <option key={p.id} value={p.id}>
                  {p.razao_social}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela Paginada */}
        <PagedDataTable
          columns={colunas}
          queryKey={[
            'reservas',
            {
              pagina,
              limite,
              busca,
              status: statusFiltro,
              parceiro_comercial_id: parceiroFiltro,
            },
          ]}
          queryFn={() =>
            reservasService.list({
              pagina,
              limite,
              busca: busca || undefined,
              status: statusFiltro,
              parceiro_comercial_id: parceiroFiltro,
            })
          }
          label="Resultados de reservas"
          emptyMessage="Nenhuma reserva encontrada."
          isPending={isPending}
          pagina={pagina}
          limite={limite}
          onPageChange={setPagina}
          onLimitChange={l => setParam('limite', l)}
        />
      </div>
    </ListPageLayout>
  )
}

export default ReservasPage
