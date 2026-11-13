import type { Column } from '@hotelmind/ui'
import { Button, ListPageLayout, SearchBar } from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Network, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Hotel } from '@/api/hoteis.service'
import { hoteisService } from '@/api/hoteis.service'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

export function HoteisPage() {
  usePageTitle('Hotéis')
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

  const { mutate: deleteHotel } = useMutation({
    mutationFn: hoteisService.delete,
    onSuccess: () => {
      toast.success('Hotel removido.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
    },
    onError: () => toast.error('Erro ao remover hotel.'),
  })

  const columns: Column<Hotel>[] = [
    { key: 'nome_fantasia', header: 'Nome Fantasia', sortable: true },
    { key: 'cnpj', header: 'CNPJ', sortable: false },
    { key: 'email_comercial', header: 'E-mail', sortable: false },
    { key: 'telefone_comercial', header: 'Telefone', sortable: false },
    {
      key: 'acoes',
      header: '',
      render: row => (
        <div className="flex items-center justify-end gap-1">
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
      ),
    },
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
      searchBar={
        <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['admin:hoteis', pagina, limite, busca, ordenar_por, direcao]}
        queryFn={() =>
          hoteisService.list({ pagina, limite, busca, ordenar_por, direcao })
        }
        label="Resultados de hotéis"
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
