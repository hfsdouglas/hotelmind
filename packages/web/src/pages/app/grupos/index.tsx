import type { Grupo } from '@hotelmind/contracts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Label,
} from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { gruposService } from '@/api/grupos.service'
import type { Column } from '@/components/data-table/data_table'
import { FilterPanel } from '@/components/data-table/filter_panel'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

export function GruposPage() {
  usePageTitle('Grupos de Permissões')
  const queryClient = useQueryClient()
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
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gruposService.delete(id),
    onSuccess: () => {
      toast.success('Grupo excluído com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error(
          'Este grupo possui usuários vinculados e não pode ser excluído.'
        )
      } else {
        toast.error('Erro ao excluir grupo.')
      }
    },
  })

  const columns: Column<Grupo>[] = [
    { key: 'grupo', header: 'Grupo', sortable: true },
    {
      key: 'descricao',
      header: 'Descrição',
      render: row =>
        row.descricao || <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <Badge variant={row.status === 'S' ? 'default' : 'secondary'}>
          {row.status === 'S' ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: row => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/grupos/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o grupo{' '}
                  <strong>{row.grupo}</strong>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(row.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Grupos"
      action={
        <Button asChild>
          <Link to="/grupos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo grupo
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={v => setParam('busca', v)}
          placeholder="Pesquisar grupos..."
        />
      }
      filters={
        <FilterPanel>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              value={status || 'all'}
              onValueChange={v => setParam('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="S">Ativo</SelectItem>
                <SelectItem value="N">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterPanel>
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={[
          'grupos',
          { pagina, limite, busca, ordenar_por, direcao, status },
        ]}
        queryFn={() =>
          gruposService.list({
            pagina,
            limite,
            busca: busca || undefined,
            status: status || undefined,
            ordenar_por: ordenar_por || undefined,
            direcao,
          })
        }
        label="Resultados de grupos"
        emptyMessage="Nenhum grupo encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={v => setParam('limite', v)}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
      />
    </ListPageLayout>
  )
}
