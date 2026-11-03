import { useTransition } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import type { CategoriaQuarto } from '@hotelmind/contracts'

export function CategoriasQuartosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const status = searchParams.get('status') as 'S' | 'N' | null

  const columns: Column<CategoriaQuarto>[] = [
    { key: 'nome', header: 'Categoria' },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <Badge variant={row.status === 'S' ? 'success' : 'secondary'}>
          {row.status === 'S' ? 'Ativa' : 'Inativa'}
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
            title="Editar categoria"
            aria-label={`Editar categoria ${row.nome}`}
          >
            <Link to={`/categorias_quartos/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Categorias de quartos"
      action={
        <Button asChild>
          <Link to="/categorias_quartos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </Link>
        </Button>
      }
      filters={
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status</span>
          <Select
            value={status ?? 'all'}
            onValueChange={value =>
              startTransition(() =>
                setSearchParams(value === 'all' ? {} : { status: value }),
              )
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="S">Ativos</SelectItem>
              <SelectItem value="N">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['categorias_quartos', { status }]}
        queryFn={() =>
          categoriasQuartosService.list({
            limite: 250,
            status: status ?? undefined,
          })
        }
        label="Resultados de categorias de quartos"
        errorMessage="Não foi possível carregar as categorias."
        emptyMessage="Nenhuma categoria cadastrada."
        isPending={isPending}
        showPagination={false}
        showResultCount={false}
      />
    </ListPageLayout>
  )
}
