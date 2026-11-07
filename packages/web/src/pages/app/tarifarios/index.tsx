import type { Tarifario } from '@hotelmind/contracts'
import { useQuery } from '@tanstack/react-query'
import { Filter, Pencil, Plus, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { tarifariosService } from '@/api/tarifarios.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { TarifarioStatusBadge } from '@/components/tarifarios/tarifario_status_badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePaginacao } from '@/hooks/usePaginacao'
import { format_iso_to_br } from '@/schemas/tarifarios/tarifario_schema'

export function TarifariosPage() {
  const { pagina, limite, busca, setParam, setParams, setPagina, isPending } =
    usePaginacao()
  const [searchParams] = useSearchParams()
  const categoria_quarto_id = searchParams.get('categoria_quarto_id') ?? ''
  const parceiro_id_param = searchParams.get('parceiro_id') ?? ''
  const ativo_param = searchParams.get('ativo')
  const ativo_filter =
    ativo_param === 'true' ? true : ativo_param === 'false' ? false : undefined

  const { data: categories } = useQuery({
    queryKey: ['categorias_quartos', 'all'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })

  const { data: parceiros_res } = useQuery({
    queryKey: ['parceiros_comerciais', 'all'],
    queryFn: () => parceirosComerciaisService.list({ limite: 250 }),
  })

  const columns: Column<Tarifario>[] = [
    { key: 'nome', header: 'Nome do tarifário' },
    {
      key: 'parceiro',
      header: 'Canal / Parceiro',
      render: row =>
        row.parceiro ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {row.parceiro.nome_fantasia || row.parceiro.razao_social}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Reserva Direta
          </span>
        ),
    },
    {
      key: 'categoria_quarto',
      header: 'Categoria de quarto',
      render: row => row.categoria_quarto.nome,
    },
    {
      key: 'regime_alimentacao',
      header: 'Regime de Alimentação',
      render: row =>
        row.regime_alimentacao ? (
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: row.regime_alimentacao.cor_pulseira }}
              aria-hidden="true"
            />
            <span>{row.regime_alimentacao.titulo}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'datas',
      header: 'Datas selecionadas',
      render: row => (
        <span title={row.datas.map(format_iso_to_br).join(', ')}>
          {row.datas.length === 1
            ? '1 dia tarifado'
            : `${row.datas.length} dias tarifados`}
        </span>
      ),
    },
    {
      key: 'valor_diaria',
      header: 'Valor da diária',
      render: row => `R$ ${row.valor_diaria}`,
    },
    {
      key: 'ativo',
      header: 'Situação',
      render: row => <TarifarioStatusBadge ativo={row.ativo} />,
    },
    {
      key: 'acoes',
      header: '',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Editar tarifário"
            aria-label={`Editar tarifário ${row.nome}`}
          >
            <Link to={`/tarifarios/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Tarifários"
      action={
        <Button asChild>
          <Link to="/tarifarios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo tarifário
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={value => setParam('busca', value)}
          placeholder="Pesquisar por nome ou categoria..."
        />
      }
      filters={
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-testid="more-filters-trigger"
              className="shrink-0"
            >
              <Filter className="mr-2 h-4 w-4" />
              Mais filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent
            data-testid="more-filters-content"
            className="min-w-[280px] sm:min-w-[320px]"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filtro-situacao">Situação</Label>
                <Select
                  value={ativo_param ?? 'all'}
                  onValueChange={value =>
                    setParam('ativo', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger
                    id="filtro-situacao"
                    aria-label="Filtrar por situação"
                  >
                    <SelectValue placeholder="Todas as situações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as situações</SelectItem>
                    <SelectItem value="true">Ativos</SelectItem>
                    <SelectItem value="false">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filtro-categoria">Categoria de quarto</Label>
                <Select
                  value={categoria_quarto_id || 'all'}
                  onValueChange={value =>
                    setParam(
                      'categoria_quarto_id',
                      value === 'all' ? '' : value
                    )
                  }
                >
                  <SelectTrigger
                    id="filtro-categoria"
                    aria-label="Filtrar por categoria"
                  >
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories?.data.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filtro-parceiro">
                  Canal / Parceiro Comercial
                </Label>
                <Select
                  value={parceiro_id_param || 'all'}
                  onValueChange={value =>
                    setParam('parceiro_id', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger
                    id="filtro-parceiro"
                    aria-label="Filtrar por parceiro comercial"
                  >
                    <SelectValue placeholder="Todos os canais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os canais</SelectItem>
                    <SelectItem value="publico">
                      Apenas Reserva Direta
                    </SelectItem>
                    {parceiros_res?.data.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome_fantasia || p.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(categoria_quarto_id || ativo_param || parceiro_id_param) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="clear-more-filters"
                  className="h-7 self-start px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setParams({
                      categoria_quarto_id: '',
                      ativo: '',
                      parceiro_id: '',
                    })
                  }}
                >
                  Limpar filtros
                  <X className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={[
          'tarifarios',
          {
            pagina,
            limite,
            busca,
            categoria_quarto_id,
            parceiro_id: parceiro_id_param,
            ativo: ativo_filter,
          },
        ]}
        queryFn={() =>
          tarifariosService.list({
            pagina,
            limite,
            busca: busca || undefined,
            categoria_quarto_id: categoria_quarto_id || undefined,
            parceiro_id: parceiro_id_param || undefined,
            ativo: ativo_filter,
          })
        }
        label="Resultados de tarifários"
        errorMessage="Não foi possível carregar os tarifários."
        emptyMessage="Nenhum tarifário encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={value => setParam('limite', value)}
      />
    </ListPageLayout>
  )
}
