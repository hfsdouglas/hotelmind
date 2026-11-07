import { CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface CategoryCardItem {
  id: string
  nome: string
  status?: string
}

export interface TarifarioCategoryCardsProps {
  categorias: CategoryCardItem[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
  error?: string
}

export function TarifarioCategoryCards({
  categorias,
  selectedIds = [],
  onChange,
  disabled = false,
  error,
}: TarifarioCategoryCardsProps) {
  const activeCategories = categorias.filter(c => c.status !== 'N')

  const handleToggle = (id: string) => {
    if (disabled) return
    const isSelected = selectedIds.includes(id)
    if (isSelected) {
      onChange(selectedIds.filter(item => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const handleSelectAll = () => {
    if (disabled) return
    const allIds = activeCategories.map(c => c.id)
    onChange(allIds)
  }

  const handleDeselectAll = () => {
    if (disabled) return
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {selectedIds.length} de {activeCategories.length} selecionada
          {selectedIds.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              disabled ||
              activeCategories.length === 0 ||
              selectedIds.length === activeCategories.length
            }
            onClick={handleSelectAll}
          >
            Selecionar todas
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || selectedIds.length === 0}
            onClick={handleDeselectAll}
          >
            Desmarcar todas
          </Button>
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          Nenhuma categoria de acomodação ativa encontrada.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {activeCategories.map(cat => {
            const isSelected = selectedIds.includes(cat.id)

            return (
              <button
                key={cat.id}
                type="button"
                disabled={disabled}
                onClick={() => handleToggle(cat.id)}
                className={`flex flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                  disabled
                    ? 'cursor-not-allowed opacity-60'
                    : isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 cursor-pointer'
                      : 'border-border hover:border-primary/50 bg-card cursor-pointer'
                }`}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">
                      {cat.nome}
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-50 text-xs text-emerald-700"
                      >
                        Ativa
                      </Badge>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
