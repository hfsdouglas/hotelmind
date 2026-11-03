import { useSuspenseQuery, type QueryKey } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { DataTable, type Column } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { ResultCount } from '@/components/data-table/result_count'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'

export interface PagedDataTableProps<T extends { id?: string }> {
  columns: Column<T>[]
  queryKey: QueryKey
  queryFn: () => Promise<{
    data: T[]
    meta?: { total: number; pagina?: number; ultima_pagina?: number; limite?: number }
  }>
  label: string
  isPending?: boolean
  errorMessage?: string
  emptyMessage?: string
  pagina?: number
  limite?: number
  onPagina?: (page: number) => void
  onLimite?: (limit: number) => void
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  onSort?: (campo: string) => void
  renderActions?: (row: T) => ReactNode
  showPagination?: boolean
  showResultCount?: boolean
  reset_key?: string
  row_count?: number
}

function PagedDataTableContent<T extends { id?: string }>({
  columns,
  queryKey,
  queryFn,
  emptyMessage,
  pagina,
  limite,
  onPagina,
  onLimite,
  ordenar_por,
  direcao,
  onSort,
  renderActions,
  showPagination = true,
  showResultCount = true,
}: PagedDataTableProps<T>) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn,
  })

  const meta = data.meta

  return (
    <div className="flex flex-1 flex-col min-h-0 gap-4">
      {showResultCount && meta && <ResultCount total={meta.total} />}
      <DataTable
        columns={columns}
        rows={data.data}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        emptyMessage={emptyMessage}
        renderActions={renderActions}
      />
      {showPagination && meta && onPagina && onLimite && (
        <DataTablePagination
          pagina={pagina ?? meta.pagina ?? 1}
          limite={limite ?? meta.limite ?? 25}
          ultima_pagina={meta.ultima_pagina ?? 1}
          onPagina={onPagina}
          onLimite={onLimite}
          className="mt-auto"
        />
      )}
    </div>
  )
}

export function PagedDataTable<T extends { id?: string }>({
  columns,
  queryKey,
  queryFn,
  isPending = false,
  label,
  errorMessage,
  emptyMessage,
  pagina,
  limite,
  onPagina,
  onLimite,
  ordenar_por,
  direcao,
  onSort,
  renderActions,
  showPagination = true,
  showResultCount = true,
  reset_key,
  row_count,
}: PagedDataTableProps<T>) {
  const column_labels = columns.map(col => col.label ?? '')
  if (renderActions) {
    column_labels.push('Ações')
  }
  const total_cols = columns.length + (renderActions ? 1 : 0)
  const computed_reset_key = reset_key ?? JSON.stringify(queryKey)

  return (
    <SearchResultsSuspense
      column_count={total_cols}
      column_labels={column_labels}
      error_message={errorMessage}
      is_pending={isPending}
      label={label}
      reset_key={computed_reset_key}
      row_count={row_count ?? limite ?? 25}
    >
      <PagedDataTableContent
        columns={columns}
        queryKey={queryKey}
        queryFn={queryFn}
        label={label}
        emptyMessage={emptyMessage}
        pagina={pagina}
        limite={limite}
        onPagina={onPagina}
        onLimite={onLimite}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        renderActions={renderActions}
        showPagination={showPagination}
        showResultCount={showResultCount}
      />
    </SearchResultsSuspense>
  )
}
