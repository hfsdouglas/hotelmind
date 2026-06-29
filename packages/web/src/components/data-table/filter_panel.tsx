import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FilterPanelProps {
  children: React.ReactNode
}

export function FilterPanel({ children }: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        <Filter className="h-4 w-4" />
        Mais filtros
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-4 rounded-md border p-4">{children}</div>
      )}
    </div>
  )
}
