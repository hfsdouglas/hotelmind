import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, Network } from 'lucide-react'
import { toast } from 'sonner'
import { hoteisService } from '@/api/hoteis.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import type { Column } from '@/components/data-table/data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Button } from '@/components/ui/button'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import type { Hotel } from '@/api/hoteis.service'

export function HoteisPage() {
  const qc = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort, isPending } =
    usePaginacao()

  const { mutate: deleteHotel } = useMutation({
    mutationFn: hoteisService.delete,
    onSuccess: () => {
      toast.success('Hotel removido.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
    },
    onError: () => toast.error('Erro ao remover hotel.'),
  })

  const columns: Column<Hotel>[] = [
    { key: 'nome_fantasia', label: 'Nome Fantasia', sortable: true },
    { key: 'cnpj', label: 'CNPJ', sortable: false },
    { key: 'email_comercial', label: 'E-mail', sortable: false },
    { key: 'telefone_comercial', label: 'Telefone', sortable: false },
  ]

  return (
    <ListPageLayout
      title="Hotéis"
      action={
        <Button asChild size="sm">
          <Link to="/hoteis/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo hotel
          </Link>
        </Button>
      }
      searchBar={<SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />}
    >
      <PagedDataTable
        columns={columns}
        queryKey={['admin:hoteis', pagina, limite, busca, ordenar_por, direcao]}
        queryFn={() => hoteisService.list({ pagina, limite, busca, ordenar_por, direcao })}
        label="Resultados de hotéis"
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
            <Button variant="ghost" size="icon" asChild title="Gerenciar rotas">
              <Link to={`/hoteis/${row.id}/rotas`}>
                <Network className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Editar">
              <Link to={`/hoteis/${row.id}/editar`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Remover"
              onClick={() => {
                if (confirm('Remover este hotel?')) deleteHotel(row.id)
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
