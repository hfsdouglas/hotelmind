import type { Reserva, ReservaStatus } from '@hotelmind/contracts'
import type { Column } from '@hotelmind/ui'
import {
  Badge,
  Button,
  Label,
  ListPageLayout,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Handshake,
  Plus,
  X,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { reservasService } from '@/api/reservas.service'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { ReservaStatusBadge } from '@/components/reservas/reserva_status_badge'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'
import { mask_phone } from '@/hooks/use_phone_mask'

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

export function ReservasPage() {
  usePageTitle('Reservas')
  const { pagina, limite, busca, setParam, setParams, setPagina, isPending } =
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

  const activeFiltersCount = [statusFiltro, parceiroFiltro].filter(
    Boolean
  ).length

  const colunas: Column<Reserva>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'Código',
        render: r => (
          <div className="flex flex-col">
            <Link
              to={`/reservas/${r.id}`}
              className="font-mono font-semibold text-primary hover:underline"
            >
              {r.codigo}
            </Link>
            <span className="text-[11px] text-muted-foreground">
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
            <span className="font-medium text-foreground">
              {r.titular_nome}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {r.titular_telefone && (
                <span>{mask_phone(r.titular_telefone)}</span>
              )}
              {r.parceiro_comercial && (
                <span className="flex items-center gap-1 text-primary font-medium">
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
              <span className="text-muted-foreground">In:</span>{' '}
              <span className="font-medium text-foreground">
                {formatarDataBR(r.check_in)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Out:</span>{' '}
              <span className="font-medium text-foreground">
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
            <span className="font-semibold text-foreground">
              Suíte {r.quarto?.identificacao || '-'}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                style={{
                  backgroundColor: r.regime_alimentacao?.cor_pulseira || '#999',
                }}
              />
              <span className="text-muted-foreground truncate max-w-[120px]">
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
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-800'
                }`}
              >
                {r.fichas_preenchidas} de {r.total_hospedes} preenchida(s)
              </Badge>
              {r.fnrh_enviada_em && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
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
          <span className="font-semibold text-sm text-foreground">
            {formatarMoeda(r.valor_total)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: r => <ReservaStatusBadge status={r.status} />,
      },
      {
        key: 'acoes',
        header: '',
        render: r => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Visualizar reserva"
            >
              <Link to={`/reservas/${r.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Editar reserva"
            >
              <Link to={`/reservas/${r.id}/editar`}>
                <Edit className="h-4 w-4" />
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
        <Button asChild>
          <Link to="/reservas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={val => setParam('busca', val)}
          placeholder="Buscar por código ou nome do hóspede..."
        />
      }
      filters={
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-testid="more-filters-trigger"
              className="shrink-0 h-9"
            >
              <Filter className="mr-2 h-4 w-4" />
              Mais filtros
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-[10px]"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            data-testid="more-filters-content"
            className="w-80 space-y-4 p-4"
            align="end"
          >
            {/* Filtro de Status */}
            <div className="space-y-1.5">
              <Label htmlFor="filtro-status">Status da Reserva</Label>
              <Select
                value={statusFiltro || 'all'}
                onValueChange={v => setParam('status', v === 'all' ? '' : v)}
              >
                <SelectTrigger id="filtro-status" className="h-9 text-xs">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="a_confirmar">A Confirmar</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="check_in">Check-in</SelectItem>
                  <SelectItem value="check_out">Check-out</SelectItem>
                  <SelectItem value="no_show">No-show</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Parceiro */}
            <div className="space-y-1.5">
              <Label htmlFor="filtro-parceiro">Parceiro Comercial</Label>
              <Select
                value={parceiroFiltro || 'all'}
                onValueChange={v =>
                  setParam('parceiro_id', v === 'all' ? '' : v)
                }
              >
                <SelectTrigger id="filtro-parceiro" className="h-9 text-xs">
                  <SelectValue placeholder="Todos os parceiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os parceiros</SelectItem>
                  {parceiros.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-testid="clear-more-filters"
                className="h-8 w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setParams({ status: '', parceiro_id: '' })
                }}
              >
                Limpar filtros
                <X className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </PopoverContent>
        </Popover>
      }
    >
      <PagedDataTable
        columns={colunas}
        queryKey={[
          'reservas',
          {
            pagina,
            limite,
            busca: busca || undefined,
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
    </ListPageLayout>
  )
}

export default ReservasPage
