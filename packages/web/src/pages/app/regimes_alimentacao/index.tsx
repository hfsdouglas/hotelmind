import type { RegimeAlimentacao } from '@hotelmind/contracts'
import { Button, Label } from '@hotelmind/ui'
import { Filter, Pencil, Plus, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Badge } from '@/components/ui/badge'
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
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

export function RegimesAlimentacaoPage() {
  usePageTitle('Regimes de Alimentação')
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()
  const [searchParams] = useSearchParams()

  const ativoParam = searchParams.get('ativo')
  const ativoFilter =
    ativoParam === 'true' ? true : ativoParam === 'false' ? false : undefined

  const columns: Column<RegimeAlimentacao>[] = [
    {
      key: 'titulo',
      header: 'Título do regime',
      render: row => <span className="font-medium">{row.titulo}</span>,
    },
    {
      key: 'cor_pulseira',
      header: 'Cor da pulseira',
      render: row => (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-7 rounded-sm border shadow-xs"
            style={{ backgroundColor: row.cor_pulseira }}
            title={`Cor da pulseira: ${row.cor_pulseira}`}
          />
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {row.cor_pulseira}
          </span>
        </div>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: row => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.descricao || '—'}
        </span>
      ),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: row => (
        <Badge variant={row.ativo ? 'success' : 'secondary'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: row => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Editar regime"
            aria-label={`Editar regime ${row.titulo}`}
          >
            <Link to={`/regimes_alimentacao/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Regimes de Alimentação"
      action={
        <Button asChild>
          <Link to="/regimes_alimentacao/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo regime
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={val => setParam('busca', val)}
          placeholder="Pesquisar por título ou descrição..."
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
              {ativoFilter !== undefined && (
                <span className="ml-1.5 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent data-testid="more-filters-content" className="w-72">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filtro-status">Status</Label>
                <Select
                  value={
                    ativoFilter === undefined
                      ? 'all'
                      : ativoFilter
                        ? 'true'
                        : 'false'
                  }
                  onValueChange={val =>
                    setParam('ativo', val === 'all' ? '' : val)
                  }
                >
                  <SelectTrigger
                    id="filtro-status"
                    aria-label="Filtrar por status"
                  >
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Ativos</SelectItem>
                    <SelectItem value="false">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ativoFilter !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 self-start px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setParam('ativo', '')}
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
          'regimes_alimentacao',
          { pagina, limite, busca, ativo: ativoFilter },
        ]}
        queryFn={() =>
          regimesAlimentacaoService.list({
            pagina,
            limite,
            busca: busca || undefined,
            ativo: ativoFilter,
          })
        }
        label="Resultados de regimes de Alimentação"
        errorMessage="Não foi possível carregar os regimes de Alimentação."
        emptyMessage="Nenhum regime de Alimentação cadastrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
      />
    </ListPageLayout>
  )
}
