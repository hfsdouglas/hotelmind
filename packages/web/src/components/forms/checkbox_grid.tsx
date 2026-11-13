import { Checkbox } from '@hotelmind/ui'

export interface CheckboxGridItem {
  id: string
  label: string
}

interface CheckboxGridProps {
  items: CheckboxGridItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  disabled?: boolean
  emptyMessage?: string
}

export function CheckboxGrid({
  items,
  selectedIds,
  onToggle,
  disabled,
  emptyMessage = 'Nenhuma opção disponível.',
}: CheckboxGridProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map(item => (
        <label key={item.id} className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={selectedIds.has(item.id)}
            onCheckedChange={() => onToggle(item.id)}
            disabled={disabled}
          />
          <span className="text-sm">{item.label}</span>
        </label>
      ))}
    </div>
  )
}
