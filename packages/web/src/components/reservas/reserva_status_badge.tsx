import type { ReservaStatus } from '@hotelmind/contracts'
import { Badge } from '@hotelmind/ui'
import { STATUS_RESERVA_LABEL } from '@/types/calendario_reserva'

const STATUS_CLASSES: Record<ReservaStatus, string> = {
  a_confirmar:
    'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-800',
  confirmada:
    'bg-sky-500/10 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-800',
  check_in:
    'bg-status-checkin/10 text-status-checkin-foreground border-status-checkin/40',
  check_out: 'bg-muted text-muted-foreground border-border',
  no_show:
    'bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-800',
  cancelada: 'bg-destructive/10 text-destructive border-destructive/30',
}

interface ReservaStatusBadgeProps {
  status: ReservaStatus
}

export function ReservaStatusBadge({ status }: ReservaStatusBadgeProps) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {STATUS_RESERVA_LABEL[status]}
    </Badge>
  )
}
