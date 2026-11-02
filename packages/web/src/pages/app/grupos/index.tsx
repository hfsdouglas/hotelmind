import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/alert-dialog'
import { DataTable, type Column } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { FilterPanel } from '@/components/data-table/filter_panel'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePaginacao } from '@/hooks/usePaginacao'
import { gruposService } from '@/api/grupos.service'
import type { Grupo } from '@hotelmind/contracts'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'

export function GruposPage() {
  const queryClient = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort, isPending } =
    usePaginacao()

  const status = new URLSearchParams(window.location.search).get('status') ?? ''

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gruposService.delete(id),
    onSuccess: () => {
      toast.success('Grupo excluído com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Este grupo possui usuários vinculados e não pode ser excluído.')
      } else {
        toast.error('Erro ao excluir grupo.')
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Grupos</h1>
        <Button asChild>
          <Link to="/grupos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo grupo
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <SearchBar
          value={busca}
          onSearch={v => setParam('busca', v)}
          placeholder="Pesquisar grupos..."
        />
        <FilterPanel>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status || 'all'} onValueChange={v => setParam('status', v === 'all' ? '' : v)}>
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
      </div>
      <SearchResultsSuspense
        column_count={4}
        column_labels={['Grupo', 'Descrição', 'Status', '']}
        is_pending={isPending}
        label="Resultados de grupos"
        reset_key={`${pagina}-${limite}-${busca}-${ordenar_por}-${direcao}-${status}`}
        row_count={limite}
      >
        <GruposResults
          busca={busca}
          delete_group={id => deleteMutation.mutate(id)}
          direcao={direcao}
          limite={limite}
          onLimite={v => setParam('limite', v)}
          onPagina={setPagina}
          onSort={toggleSort}
          ordenar_por={ordenar_por}
          pagina={pagina}
          status={status}
        />
      </SearchResultsSuspense>
    </div>
  )
}

interface GruposResultsProps {
  busca: string
  delete_group: (id: string) => void
  direcao: 'asc' | 'desc'
  limite: number
  onLimite: (value: number) => void
  onPagina: (value: number) => void
  onSort: (value: string) => void
  ordenar_por: string
  pagina: number
  status: string
}

function GruposResults({
  busca,
  delete_group,
  direcao,
  limite,
  onLimite,
  onPagina,
  onSort,
  ordenar_por,
  pagina,
  status,
}: GruposResultsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['grupos', { pagina, limite, busca, ordenar_por, direcao, status }],
    queryFn: () =>
      gruposService.list({
        pagina,
        limite,
        busca: busca || undefined,
        ordenar_por: ordenar_por || undefined,
        direcao,
        status: status || undefined,
      }),
  })
  const columns: Column<Grupo>[] = [
    { key: 'grupo', header: 'Grupo', sortable: true },
    {
      key: 'descricao',
      header: 'Descrição',
      render: row => row.descricao ?? <span className="text-muted-foreground">—</span>,
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
      key: 'actions',
      header: '',
      render: row => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/grupos/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o grupo <strong>{row.grupo}</strong>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => delete_group(row.id)}
                >Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  return (
    <>
      <ResultCount total={data.meta.total} />
      <DataTable columns={columns} data={data.data} ordenar_por={ordenar_por} direcao={direcao} onSort={onSort} emptyMessage="Nenhum grupo encontrado." />
      <DataTablePagination pagina={pagina} limite={limite} ultima_pagina={data.meta.ultima_pagina} onPageChange={onPagina} onLimitChange={onLimite} />
    </>
  )
}
