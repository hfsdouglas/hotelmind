import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import type { Administrador } from '@/api/administradores.service'

export function AdministradoresPage() {
  const qc = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort } =
    usePaginacao()

  const { data, isLoading } = useQuery({
    queryKey: ['admin:administradores', pagina, limite, busca, ordenar_por, direcao],
    queryFn: () => administradoresService.list({ pagina, limite, busca, ordenar_por, direcao }),
  })

  const { mutate: deleteAdmin } = useMutation({
    mutationFn: administradoresService.delete,
    onSuccess: () => {
      toast.success('Administrador removido.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
    },
    onError: () => toast.error('Erro ao remover administrador.'),
  })

  const columns = [
    { key: 'nome_completo' as const, label: 'Nome', sortable: true },
    { key: 'email' as const, label: 'E-mail', sortable: true },
    { key: 'status' as const, label: 'Status', sortable: false },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Button asChild size="sm">
          <Link to="/administradores/novo"><Plus className="mr-1 h-4 w-4" />Novo admin</Link>
        </Button>
      </div>

      <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      {data && <ResultCount total={data.meta.total} />}

      <DataTable<Administrador>
        columns={columns}
        rows={data?.data ?? []}
        isLoading={isLoading}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/administradores/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if (confirm('Remover este administrador?')) deleteAdmin(row.id) }}
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
