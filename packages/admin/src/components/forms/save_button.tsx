import { Button } from '@hotelmind/ui'
import { Save } from 'lucide-react'
import type { ComponentProps } from 'react'

export interface SaveButtonProps extends ComponentProps<typeof Button> {
  isPending?: boolean
  label?: string
  pendingLabel?: string
}

export function SaveButton({
  isPending = false,
  label = 'Salvar',
  pendingLabel = 'Salvando...',
  disabled,
  children,
  ...props
}: SaveButtonProps) {
  return (
    <Button type="submit" disabled={disabled ?? isPending} {...props}>
      <Save className="h-4 w-4" aria-hidden="true" />
      {children ?? (isPending ? pendingLabel : label)}
    </Button>
  )
}
