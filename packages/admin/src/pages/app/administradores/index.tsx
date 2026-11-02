import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { administradoresService } from '@/api/administradores.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import { DataTable } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { Button } from '@/components/ui/button'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Button asChild size="sm">
          <Link to="/administradores/novo"><Plus className="mr-1 h-4 w-4" />Novo admin</Link>
        </Button>
      </div>

      <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      <SearchResultsSuspense
        column_count={4}
        column_labels={['Nome', 'E-mail', 'Status', 'Ações']}
        is_pending={isPending}
        label="Resultados de administradores"
        reset_key={`${pagina}-${limite}-${busca}-${ordenar_por}-${direcao}`}
        row_count={limite}
      >
        <AdministradoresResults
          busca={busca}
          direcao={direcao}
          limite={limite}
          onDelete={deleteAdmin}
          onLimite={v => setParam('limite', String(v))}
          onPagina={setPagina}
          onSort={toggleSort}
          ordenar_por={ordenar_por}
          pagina={pagina}
        />
      </SearchResultsSuspense>
    </div>
  )
}

interface AdministradoresResultsProps {
  busca: string
  direcao: 'asc' | 'desc'
  limite: number
  onDelete: (id: string) => void
  onLimite: (value: number) => void
  onPagina: (value: number) => void
  onSort: (value: string) => void
  ordenar_por: string
  pagina: number
}

function AdministradoresResults({
  busca,
  direcao,
  limite,
  onDelete,
  onLimite,
  onPagina,
  onSort,
  ordenar_por,
  pagina,
}: AdministradoresResultsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['admin:administradores', pagina, limite, busca, ordenar_por, direcao],
    queryFn: () => administradoresService.list({ pagina, limite, busca, ordenar_por, direcao }),
  })
  const columns = [
    { key: 'nome_completo' as const, label: 'Nome', sortable: true },
    { key: 'email' as const, label: 'E-mail', sortable: true },
    { key: 'status' as const, label: 'Status', sortable: false },
  ]

  return (
    <>
      <ResultCount total={data.meta.total} />
      <DataTable<Administrador>
        columns={columns}
        rows={data.data}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        renderActions={row => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/administradores/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if (confirm('Remover este administrador?')) onDelete(row.id) }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />
      <DataTablePagination
        pagina={data.meta.pagina}
        ultima_pagina={data.meta.ultima_pagina}
        limite={limite}
        onPagina={onPagina}
        onLimite={onLimite}
      />
    </>
  )
}
