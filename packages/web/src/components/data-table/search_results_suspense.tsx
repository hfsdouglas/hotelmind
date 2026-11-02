import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SearchResultsSkeletonProps {
  column_labels?: string[]
  column_count: number
  row_count?: number
}

interface SearchResultsSuspenseProps {
  children: ReactNode
  column_labels?: string[]
  column_count: number
  error_message?: string
  is_pending?: boolean
  label: string
  reset_key?: string
  row_count?: number
}

interface SearchResultsErrorBoundaryProps {
  children: ReactNode
  error_message: string
  reset_key?: string
}

interface SearchResultsErrorBoundaryState {
  has_error: boolean
}

export function SearchResultsSkeleton({
  column_labels = [],
  column_count,
  row_count = 5,
}: SearchResultsSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando resultados"
      className="rounded-md border"
    >
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            {column_labels.map((label, column_index) => (
              <TableHead key={`${label}-${column_index}`}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: row_count }, (_, row_index) => (
            <TableRow key={row_index}>
              {Array.from({ length: column_count }, (_, column_index) => (
                <TableCell key={column_index}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

class SearchResultsErrorBoundary extends Component<
  SearchResultsErrorBoundaryProps,
  SearchResultsErrorBoundaryState
> {
  state: SearchResultsErrorBoundaryState = { has_error: false }

  static getDerivedStateFromError(): SearchResultsErrorBoundaryState {
    return { has_error: true }
  }

  componentDidUpdate(previous_props: SearchResultsErrorBoundaryProps) {
    if (previous_props.reset_key !== this.props.reset_key && this.state.has_error) {
      this.setState({ has_error: false })
    }
  }

  render() {
    if (this.state.has_error) {
      return <p className="text-sm text-destructive">{this.props.error_message}</p>
    }

    return this.props.children
  }
}

export function SearchResultsSuspense({
  children,
  column_labels = [],
  column_count,
  error_message = 'Não foi possível carregar os resultados.',
  is_pending = false,
  label,
  reset_key,
  row_count = 5,
}: SearchResultsSuspenseProps) {
  const resolved_column_labels = Array.from(
    { length: column_count },
    (_, index) => column_labels[index] ?? '',
  )
  const was_pending = useRef(false)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (is_pending) {
      was_pending.current = true
      setAnnouncement('Atualizando resultados.')
    } else if (was_pending.current) {
      was_pending.current = false
      setAnnouncement('Resultados atualizados.')
    }
  }, [is_pending])

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      <div aria-busy={is_pending || undefined} aria-label={label} className="relative flex flex-col gap-4" role="region">
        <SearchResultsErrorBoundary error_message={error_message} reset_key={reset_key}>
          <Suspense
            fallback={
              <SearchResultsSkeleton
                column_count={column_count}
                column_labels={resolved_column_labels}
                row_count={row_count}
              />
            }
          >
            {children}
          </Suspense>
        </SearchResultsErrorBoundary>
        {is_pending && (
          <div className="pointer-events-none mt-2 opacity-60" aria-hidden="true">
            <SearchResultsSkeleton
              column_count={column_count}
              column_labels={resolved_column_labels}
              row_count={row_count}
            />
          </div>
        )}
      </div>
    </>
  )
}
