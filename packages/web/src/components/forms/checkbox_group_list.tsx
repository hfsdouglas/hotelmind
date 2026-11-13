import { Checkbox } from '@hotelmind/ui'
import type { CheckboxGridItem } from './checkbox_grid'

export interface CheckboxGroup {
  label: string
  items: CheckboxGridItem[]
}

interface CheckboxGroupListProps {
  groups: CheckboxGroup[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  disabled?: boolean
  emptyMessage?: string
}

export function CheckboxGroupList({
  groups,
  selectedIds,
  onToggle,
  disabled,
  emptyMessage = 'Nenhuma opção disponível.',
}: CheckboxGroupListProps) {
  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {groups.map(group => (
        <div key={group.label}>
          <p className="font-medium mb-2">{group.label}</p>
          <div className="flex flex-col gap-2">
            {group.items.map(item => (
              <label
                key={item.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                  disabled={disabled}
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
