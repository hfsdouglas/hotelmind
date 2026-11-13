import type { Quarto } from '@hotelmind/contracts'
import type { Column } from '@hotelmind/ui'
import {
  Badge,
  Button,
  Checkbox,
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
import { Filter, Pencil, Plus, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { quartosService } from '@/api/quartos.service'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

function format_bed_type(type: string) {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function QuartosPage() {
  usePageTitle('Quartos')
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()
  const [searchParams] = useSearchParams()
  const categoria_ids = (searchParams.get('categoria_id') ?? '')
    .split(',')
    .filter(Boolean)
  const status = searchParams.get('status') as 'S' | 'N' | null
  const { data: categories } = useQuery({
    queryKey: ['categorias_quartos', 'all'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })

  const columns: Column<Quarto>[] = [
    { key: 'identificacao', header: 'Quarto' },
    {
      key: 'categoria',
      header: 'Categoria',
      render: row => row.categoria.nome,
    },
    { key: 'limite_hospedes', header: 'Limite de hóspedes' },
    {
      key: 'camas',
      header: 'Camas',
      render: row =>
        row.camas
          .map(bed => `${bed.quantidade}x ${format_bed_type(bed.tipo)}`)
          .join(', '),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <Badge variant={row.status === 'S' ? 'success' : 'secondary'}>
          {row.status === 'S' ? 'Ativo' : 'Inativo'}
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
            title="Editar quarto"
            aria-label={`Editar quarto ${row.identificacao}`}
          >
            <Link to={`/quartos/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Quartos"
      action={
        <Button asChild>
          <Link to="/quartos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo quarto
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={value => setParam('busca', value)}
          placeholder="Pesquisar por quarto, categoria ou cama..."
        />
      }
      filters={
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Mais filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex max-h-[min(28rem,70vh)] flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={status ?? 'all'}
                  onValueChange={value =>
                    setParam('status', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="S">Ativos</SelectItem>
                    <SelectItem value="N">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Categorias</Label>
                <div className="flex flex-col gap-2">
                  {categories?.data.map(category => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={categoria_ids.includes(category.id)}
                        onCheckedChange={checked => {
                          const next = checked
                            ? [...categoria_ids, category.id]
                            : categoria_ids.filter(id => id !== category.id)
                          setParam('categoria_id', next.join(','))
                        }}
                      />
                      <span>{category.nome}</span>
                    </label>
                  ))}
                </div>
                {categoria_ids.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setParam('categoria_id', '')}
                  >
                    Limpar categorias
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['quartos', { pagina, limite, busca, categoria_ids, status }]}
        queryFn={() =>
          quartosService.list({
            pagina,
            limite,
            busca: busca || undefined,
            categoria_id: categoria_ids.length
              ? categoria_ids.join(',')
              : undefined,
            status: status ?? undefined,
          })
        }
        label="Resultados de quartos"
        errorMessage="Não foi possível carregar os quartos."
        emptyMessage="Nenhum quarto encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={value => setParam('limite', value)}
      />
    </ListPageLayout>
  )
}
