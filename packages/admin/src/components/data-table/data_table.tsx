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
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  onSort?: (campo: string) => void
  isLoading?: boolean
  emptyMessage?: string
  renderActions?: (row: T) => React.ReactNode
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  ordenar_por,
  direcao,
  onSort,
  isLoading,
  emptyMessage = 'Nenhum resultado encontrado.',
  renderActions,
}: DataTableProps<T>) {
  const totalCols = columns.length + (renderActions ? 1 : 0)

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
                  {col.label}
                  {col.sortable && <SortIcon campo={col.key} />}
                </span>
              </TableHead>
            ))}
            {renderActions && <TableHead className="w-[100px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="text-center text-muted-foreground py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={(row as { id?: string }).id ?? i}>
                {columns.map(col => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
                {renderActions && <TableCell>{renderActions(row)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
