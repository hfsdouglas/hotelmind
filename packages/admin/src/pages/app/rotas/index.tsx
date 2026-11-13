import type { Column } from '@hotelmind/ui'
import { Button, ListPageLayout, SearchBar } from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Rota } from '@/api/rotas.service'
import { rotasService } from '@/api/rotas.service'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

export function RotasPage() {
  usePageTitle('Rotas')
  const qc = useQueryClient()
  const {
    pagina,
    limite,
    busca,
    ordenar_por,
    direcao,
    setParam,
    setPagina,
    toggleSort,
    isPending,
  } = usePaginacao()

  const { mutate: deleteRota } = useMutation({
    mutationFn: rotasService.delete,
    onSuccess: () => {
      toast.success('Rota removida.')
      qc.invalidateQueries({ queryKey: ['admin:rotas'] })
    },
    onError: () =>
      toast.error(
        'Rota vinculada a hotéis ou grupos. Remova os vínculos antes.'
      ),
  })

  const columns: Column<Rota>[] = [
    { key: 'modulo', header: 'Módulo', sortable: true },
    { key: 'recurso', header: 'Recurso', sortable: true },
    { key: 'rota', header: 'Rota', sortable: false },
    { key: 'icone', header: 'Ícone', sortable: false },
    { key: 'ordem', header: 'Ordem', sortable: true },
    {
      key: 'acoes',
      header: '',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/rotas/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Remover esta rota?')) deleteRota(row.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Rotas"
      action={
        <Button asChild size="sm">
          <Link to="/rotas/nova">
            <Plus className="mr-1 h-4 w-4" />
            Nova rota
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['admin:rotas', pagina, limite, busca, ordenar_por, direcao]}
        queryFn={() =>
          rotasService.list({ pagina, limite, busca, ordenar_por, direcao })
        }
        label="Resultados de rotas"
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={v => setParam('limite', String(v))}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
      />
    </ListPageLayout>
  )
}
