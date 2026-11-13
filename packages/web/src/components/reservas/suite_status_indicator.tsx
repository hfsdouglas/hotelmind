import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hotelmind/ui'
import { cn } from '@/lib/utils'
import { ROOM_STATUS_LABEL, type Room } from '@/types/calendario_reserva'

const DOT_CLASS: Record<Room['status'], string> = {
  disponivel: 'bg-status-available',
  bloqueado: 'bg-status-blocked',
  manutencao: 'bg-status-maintenance',
  limpeza: 'bg-status-cleaning',
  checkin: 'bg-status-checkin',
}

interface SuiteStatusIndicatorProps {
  room: Room
}

export function SuiteStatusIndicator({ room }: SuiteStatusIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            <div
              data-status={room.status}
              className={cn(
                'size-2 rounded-full shrink-0',
                DOT_CLASS[room.status]
              )}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm">{room.numero}</span>
              <span className="text-xs text-muted-foreground truncate">
                {room.tipo}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{ROOM_STATUS_LABEL[room.status]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
