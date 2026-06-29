import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, Network } from 'lucide-react'
import { toast } from 'sonner'
import { hoteisService } from '@/api/hoteis.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import { DataTable } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { Button } from '@/components/ui/button'
import type { Hotel } from '@/api/hoteis.service'

export function HoteisPage() {
  const qc = useQueryClient()
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort } =
    usePaginacao()

  const { data, isLoading } = useQuery({
    queryKey: ['admin:hoteis', pagina, limite, busca, ordenar_por, direcao],
    queryFn: () => hoteisService.list({ pagina, limite, busca, ordenar_por, direcao }),
  })

  const { mutate: deleteHotel } = useMutation({
    mutationFn: hoteisService.delete,
    onSuccess: () => {
      toast.success('Hotel removido.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
    },
    onError: () => toast.error('Erro ao remover hotel.'),
  })

  const columns = [
    { key: 'nome_fantasia' as const, label: 'Nome Fantasia', sortable: true },
    { key: 'cnpj' as const, label: 'CNPJ', sortable: false },
    { key: 'email_comercial' as const, label: 'E-mail', sortable: false },
    { key: 'telefone_comercial' as const, label: 'Telefone', sortable: false },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hotéis</h1>
        <Button asChild size="sm">
          <Link to="/hoteis/novo"><Plus className="mr-1 h-4 w-4" />Novo hotel</Link>
        </Button>
      </div>

      <SearchBar
        defaultValue={busca}
        onSearch={v => setParam('busca', v)}
      />

      {data && <ResultCount total={data.meta.total} />}

      <DataTable<Hotel>
        columns={columns}
        rows={data?.data ?? []}
        isLoading={isLoading}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild title="Gerenciar rotas">
              <Link to={`/hoteis/${row.id}/rotas`}><Network className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Editar">
              <Link to={`/hoteis/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link>
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
