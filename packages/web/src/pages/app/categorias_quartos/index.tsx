import { useSuspenseQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/data-table/data_table'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import type { CategoriaQuarto } from '@hotelmind/contracts'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'

export function CategoriasQuartosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const status = searchParams.get('status') as 'S' | 'N' | null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Categorias de quartos</h1><Button asChild><Link to="/categorias_quartos/novo"><Plus className="mr-2 h-4 w-4" />Nova categoria</Link></Button></div>
      <div className="flex items-center gap-3"><span className="text-sm font-medium">Status</span><Select value={status ?? 'all'} onValueChange={value => startTransition(() => setSearchParams(value === 'all' ? {} : { status: value }))}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="S">Ativos</SelectItem><SelectItem value="N">Inativos</SelectItem></SelectContent></Select></div>
      <SearchResultsSuspense column_count={3} column_labels={['Categoria', 'Status', '']} error_message="Não foi possível carregar as categorias." is_pending={isPending} label="Resultados de categorias de quartos" reset_key={status ?? 'all'} row_count={250}>
        <CategoriasResults status={status} />
      </SearchResultsSuspense>
    </div>
  )
}

function CategoriasResults({ status }: { status: 'S' | 'N' | null }) {
  const { data } = useSuspenseQuery({
    queryKey: ['categorias_quartos', { status }],
    queryFn: () => categoriasQuartosService.list({ limite: 250, status: status ?? undefined }),
  })
  const columns: Column<CategoriaQuarto>[] = [
    { key: 'nome', header: 'Categoria' },
    { key: 'status', header: 'Status', render: row => <Badge variant={row.status === 'S' ? 'success' : 'secondary'}>{row.status === 'S' ? 'Ativa' : 'Inativa'}</Badge> },
    { key: 'acoes', header: '', render: row => <div className="flex justify-end"><Button variant="ghost" size="icon" asChild title="Editar categoria" aria-label={`Editar categoria ${row.nome}`}><Link to={`/categorias_quartos/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link></Button></div> },
  ]

  return <DataTable columns={columns} data={data.data} emptyMessage="Nenhuma categoria cadastrada." />
}
