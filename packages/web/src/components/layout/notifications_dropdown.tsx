import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  sidebarItemClass,
} from '@hotelmind/ui'
import { Bell } from 'lucide-react'

interface NotificationsDropdownProps {
  /** `bar` is the icon button of the mobile bar; `sidebar` is a menu row. */
  variant?: 'bar' | 'sidebar'
  collapsed?: boolean
  count?: number
}

export function NotificationsDropdown({
  variant = 'bar',
  collapsed = false,
  count = 0,
}: NotificationsDropdownProps) {
  const label = count > 0 ? `Notificações, ${count} não lidas` : 'Notificações'
  const dot = count > 0 && (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 size-2.5 rounded-full bg-destructive ring-2 ring-sidebar"
    />
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === 'sidebar' ? (
          <button
            type="button"
            aria-label={label}
            className={sidebarItemClass({ collapsed })}
          >
            <span className="relative flex shrink-0">
              <Bell className="size-5" aria-hidden="true" />
              {collapsed && dot}
            </span>
            <span className={cn('flex-1 text-left', collapsed && 'sr-only')}>
              Notificações
            </span>
            {!collapsed && count > 0 && (
              <span
                aria-hidden="true"
                className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold tabular-nums text-destructive-foreground"
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className="relative"
          >
            <Bell className="size-5" aria-hidden="true" />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-destructive ring-2 ring-background"
              />
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        aria-label="Notificações"
        side={variant === 'bar' ? 'bottom' : collapsed ? 'right' : 'top'}
        align={variant === 'bar' ? 'end' : 'start'}
        className="w-72 bg-popover p-2 text-popover-foreground"
      >
        <p className="px-2 py-1 text-sm font-medium">Notificações</p>
        <Separator className="my-1" />
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          Nenhuma notificação.
        </p>
      </PopoverContent>
    </Popover>
  )
}
