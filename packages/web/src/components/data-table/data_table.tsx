import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  onSort?: (campo: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  ordenar_por,
  direcao,
  onSort,
  isLoading,
  emptyMessage = 'Nenhum resultado encontrado.',
}: DataTableProps<T>) {
  function SortIcon({ campo }: { campo: string }) {
    if (!onSort) return null
    if (ordenar_por !== campo) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
    return direcao === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead
                key={col.key}
                className={col.sortable && onSort ? 'cursor-pointer select-none' : ''}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="flex items-center">
                  {col.header}
                  {col.sortable && <SortIcon campo={col.key} />}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={(row as { id?: string }).id ?? i}>
                {columns.map(col => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
