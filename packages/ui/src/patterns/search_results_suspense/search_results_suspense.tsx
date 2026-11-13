import {
  Component,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Skeleton } from '../../components/skeleton/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table/table'
import { cn } from '../../lib/cn'

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
  row_count = 8,
}: SearchResultsSkeletonProps) {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando resultados"
      className="flex flex-1 min-h-0 flex-col rounded-md border overflow-hidden"
    >
      <Table containerClassName="h-full" className="table-fixed">
        <TableHeader>
          <TableRow>
            {column_labels.map((label, column_index) => (
              <TableHead key={`${label}-${column_index}`}>
                {label || <span className="sr-only">Ações</span>}
              </TableHead>
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
    </section>
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
    if (
      previous_props.reset_key !== this.props.reset_key &&
      this.state.has_error
    ) {
      this.setState({ has_error: false })
    }
  }

  render() {
    if (this.state.has_error) {
      return (
        <p className="text-sm text-destructive">{this.props.error_message}</p>
      )
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
  row_count = 8,
}: SearchResultsSuspenseProps) {
  const resolved_column_labels = Array.from(
    { length: column_count },
    (_, index) => column_labels[index] ?? ''
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
      <section
        aria-busy={is_pending || undefined}
        aria-label={label}
        className="relative flex flex-1 flex-col min-h-0 gap-4"
      >
        <SearchResultsErrorBoundary
          error_message={error_message}
          reset_key={reset_key}
        >
          <Suspense
            fallback={
              <SearchResultsSkeleton
                column_count={column_count}
                column_labels={resolved_column_labels}
                row_count={row_count}
              />
            }
          >
            <div
              className={cn(
                'flex flex-1 flex-col min-h-0 transition-opacity duration-200',
                is_pending && 'opacity-50 pointer-events-none'
              )}
            >
              {children}
            </div>
          </Suspense>
        </SearchResultsErrorBoundary>
      </section>
    </>
  )
}
