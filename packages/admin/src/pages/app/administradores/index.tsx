import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { administradoresService } from '@/api/administradores.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import type { Column } from '@/components/data-table/data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Button } from '@/components/ui/button'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import type { Administrador } from '@/api/administradores.service'

export function AdministradoresPage() {
  const qc = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort, isPending } =
    usePaginacao()

  const { mutate: deleteAdmin } = useMutation({
    mutationFn: administradoresService.delete,
    onSuccess: () => {
      toast.success('Administrador removido.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
    },
    onError: () => toast.error('Erro ao remover administrador.'),
  })

  const columns: Column<Administrador>[] = [
    { key: 'nome_completo', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ]

  return (
    <ListPageLayout
      title="Administradores"
      action={
        <Button asChild size="sm">
          <Link to="/administradores/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo admin
          </Link>
        </Button>
      }
      searchBar={<SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />}
    >
      <PagedDataTable
        columns={columns}
        queryKey={['admin:administradores', pagina, limite, busca, ordenar_por, direcao]}
        queryFn={() => administradoresService.list({ pagina, limite, busca, ordenar_por, direcao })}
        label="Resultados de administradores"
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPagina={setPagina}
        onLimite={v => setParam('limite', String(v))}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/administradores/${row.id}/editar`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Remover este administrador?')) deleteAdmin(row.id)
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />
    </ListPageLayout>
  )
}
