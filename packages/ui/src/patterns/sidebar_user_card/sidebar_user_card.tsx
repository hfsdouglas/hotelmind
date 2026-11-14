import type { ComponentType } from 'react'
import { Avatar, AvatarFallback } from '../../components/avatar/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/dropdown_menu/dropdown_menu'
import { cn } from '../../lib/cn'

export interface UserMenuItem {
  id: string
  label: string
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>
  destructive?: boolean
  /** Draws a separator above the item. */
  separatorBefore?: boolean
  onSelect: () => void
}

export interface SidebarUserCardProps {
  name: string
  secondary?: string
  collapsed?: boolean
  items: UserMenuItem[]
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export function SidebarUserCard({
  name,
  secondary,
  collapsed = false,
  items,
}: SidebarUserCardProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-sidebar-border p-2 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none dark:bg-sidebar-accent',
            collapsed &&
              'justify-center border-transparent p-1 dark:bg-transparent'
          )}
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className={cn('min-w-0 flex-1', collapsed && 'contents')}>
            <span
              className={cn(
                'block truncate text-sm font-medium',
                collapsed && 'sr-only'
              )}
            >
              {name}
            </span>
            {secondary && (
              <span
                className={cn(
                  'block truncate text-xs text-sidebar-muted-foreground',
                  collapsed && 'sr-only'
                )}
              >
                {secondary}
              </span>
            )}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align={collapsed ? 'end' : 'start'}
        sideOffset={8}
        className="min-w-56"
      >
        {items.map(item => {
          const Icon = item.icon
          return (
            <span key={item.id} className="contents">
              {item.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={item.destructive ? 'destructive' : 'default'}
                onSelect={item.onSelect}
              >
                {Icon && <Icon aria-hidden="true" />}
                {item.label}
              </DropdownMenuItem>
            </span>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
