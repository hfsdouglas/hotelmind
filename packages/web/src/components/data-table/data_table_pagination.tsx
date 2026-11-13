import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface DataTablePaginationProps {
  pagina: number
  limite: number
  ultima_pagina: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  className?: string
}

export function DataTablePagination({
  pagina,
  limite,
  ultima_pagina,
  onPageChange,
  onLimitChange,
  className,
}: DataTablePaginationProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-between', className)}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página</span>
        <Select
          value={String(limite)}
          onValueChange={v => onLimitChange(Number(v))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="250">250</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">
          Página {pagina} de {ultima_pagina}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={pagina <= 1}
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(pagina - 1)}
          disabled={pagina <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(pagina + 1)}
          disabled={pagina >= ultima_pagina}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(ultima_pagina)}
          disabled={pagina >= ultima_pagina}
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
