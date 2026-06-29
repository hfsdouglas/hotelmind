import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { rotasService } from '@/api/rotas.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import { DataTable } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { Button } from '@/components/ui/button'
import type { Rota } from '@/api/rotas.service'

export function RotasPage() {
  const qc = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort } =
    usePaginacao()

  const { data, isLoading } = useQuery({
    queryKey: ['admin:rotas', pagina, limite, busca, ordenar_por, direcao],
    queryFn: () => rotasService.list({ pagina, limite, busca, ordenar_por, direcao }),
  })

  const { mutate: deleteRota } = useMutation({
    mutationFn: rotasService.delete,
    onSuccess: () => {
      toast.success('Rota removida.')
      qc.invalidateQueries({ queryKey: ['admin:rotas'] })
    },
    onError: () => toast.error('Rota vinculada a hotéis ou grupos. Remova os vínculos antes.'),
  })

  const columns = [
    { key: 'modulo' as const, label: 'Módulo', sortable: true },
    { key: 'recurso' as const, label: 'Recurso', sortable: true },
    { key: 'rota' as const, label: 'Rota', sortable: false },
    { key: 'icone' as const, label: 'Ícone', sortable: false },
    { key: 'ordem' as const, label: 'Ordem', sortable: true },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <Button asChild size="sm">
          <Link to="/rotas/nova"><Plus className="mr-1 h-4 w-4" />Nova rota</Link>
        </Button>
      </div>

      <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      {data && <ResultCount total={data.meta.total} />}

      <DataTable<Rota>
        columns={columns}
        rows={data?.data ?? []}
        isLoading={isLoading}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/rotas/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if (confirm('Remover esta rota?')) deleteRota(row.id) }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      {data && (
        <DataTablePagination
          pagina={data.meta.pagina}
          ultima_pagina={data.meta.ultima_pagina}
          limite={limite}
          onPagina={setPagina}
          onLimite={v => setParam('limite', String(v))}
        />
      )}
    </div>
  )
}
