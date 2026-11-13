import { Badge } from '@hotelmind/ui'
import { Ban, CheckCircle2 } from 'lucide-react'

interface TarifarioStatusBadgeProps {
  ativo: boolean
}

export function TarifarioStatusBadge({ ativo }: TarifarioStatusBadgeProps) {
  return (
    <Badge
      variant={ativo ? 'success' : 'secondary'}
      className="inline-flex items-center gap-1"
    >
      {ativo ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Ban className="h-3 w-3" aria-hidden="true" />
      )}
      <span>{ativo ? 'Ativo' : 'Inativo'}</span>
    </Badge>
  )
}
