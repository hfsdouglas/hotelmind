import {
  type Column,
  DataTable,
  DataTablePagination,
  ResultCount,
  SearchResultsSuspense,
} from '@hotelmind/ui'
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query'

export interface PagedDataTableProps<T extends { id?: string }> {
  columns: Column<T>[]
  queryKey: QueryKey
  queryFn: () => Promise<{
    data: T[]
    meta?: {
      total: number
      pagina?: number
      ultima_pagina?: number
      limite?: number
    }
  }>
  label: string
  isPending?: boolean
  errorMessage?: string
  emptyMessage?: string
  pagina?: number
  limite?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  onSort?: (campo: string) => void
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
  onPageChange,
  onLimitChange,
  ordenar_por,
  direcao,
  onSort,
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
        data={data.data}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        emptyMessage={emptyMessage}
      />
      {showPagination && meta && onPageChange && onLimitChange && (
        <DataTablePagination
          pagina={pagina ?? meta.pagina ?? 1}
          limite={limite ?? meta.limite ?? 25}
          ultima_pagina={meta.ultima_pagina ?? 1}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
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
  onPageChange,
  onLimitChange,
  ordenar_por,
  direcao,
  onSort,
  showPagination = true,
  showResultCount = true,
  reset_key,
  row_count,
}: PagedDataTableProps<T>) {
  const column_labels = columns.map(col => col.header ?? '')
  const computed_reset_key = reset_key ?? JSON.stringify(queryKey)

  return (
    <SearchResultsSuspense
      column_count={columns.length}
      column_labels={column_labels}
      error_message={errorMessage}
      is_pending={isPending}
      label={label}
      reset_key={computed_reset_key}
      row_count={row_count}
    >
      <PagedDataTableContent
        columns={columns}
        queryKey={queryKey}
        queryFn={queryFn}
        label={label}
        emptyMessage={emptyMessage}
        pagina={pagina}
        limite={limite}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={onSort}
        showPagination={showPagination}
        showResultCount={showResultCount}
      />
    </SearchResultsSuspense>
  )
}
