import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { usePaginacao } from '@/hooks/usePaginacao'
import { usuariosService } from '@/api/usuarios.service'
import type { Usuario } from '@hotelmind/contracts'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'

export function UsuariosPage() {
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort, isPending } =
    usePaginacao()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <Button asChild>
          <Link to="/usuarios/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo usuário
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <SearchBar
          value={busca}
          onSearch={v => setParam('busca', v)}
          placeholder="Pesquisar usuários..."
        />
      </div>
      <SearchResultsSuspense
        column_count={5}
        column_labels={['Nome', 'E-mail', 'CPF', 'Grupos', '']}
        is_pending={isPending}
        label="Resultados de usuários"
        reset_key={`${pagina}-${limite}-${busca}-${ordenar_por}-${direcao}`}
        row_count={limite}
      >
        <UsuariosResults
          busca={busca}
          direcao={direcao}
          limite={limite}
          onLimite={v => setParam('limite', v)}
          onPagina={setPagina}
          onSort={toggleSort}
          ordenar_por={ordenar_por}
          pagina={pagina}
        />
      </SearchResultsSuspense>
    </div>
  )
}

interface UsuariosResultsProps {
  busca: string
  direcao: 'asc' | 'desc'
  limite: number
  onLimite: (value: number) => void
  onPagina: (value: number) => void
  onSort: (value: string) => void
  ordenar_por: string
  pagina: number
}

function UsuariosResults({
  busca,
  direcao,
  limite,
  onLimite,
  onPagina,
  onSort,
  ordenar_por,
  pagina,
}: UsuariosResultsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['usuarios', { pagina, limite, busca, ordenar_por, direcao }],
    queryFn: () =>
      usuariosService.list({
        pagina,
        limite,
        busca: busca || undefined,
        ordenar_por: ordenar_por || undefined,
        direcao,
      }),
  })
  const columns: Column<Usuario>[] = [
    { key: 'nome_completo', header: 'Nome', sortable: true },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'cpf', header: 'CPF' },
    {
      key: 'grupos_ids',
      header: 'Grupos',
      render: row =>
        row.grupos_ids ? (
          <span className="text-xs text-muted-foreground">
            {row.grupos_ids.split(',').length} grupo(s)
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: row => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/usuarios/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <ResultCount total={data.meta.total} />
      <DataTable
        columns={columns}
        data={data.data}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        emptyMessage="Nenhum usuário encontrado."
      />
      <DataTablePagination
        pagina={pagina}
        limite={limite}
        ultima_pagina={data.meta.ultima_pagina}
        onPageChange={onPagina}
        onLimitChange={onLimite}
      />
    </>
  )
}
