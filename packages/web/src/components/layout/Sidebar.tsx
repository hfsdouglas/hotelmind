import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BedDouble,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Moon,
  Power,
  Shield,
  Sun,
  Users,
} from 'lucide-react'
import type { ElementType } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLogout } from '@/hooks/useLogout'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import type { RotaMenu } from '@/types/auth'

interface SidebarProps {
  isOpen: boolean
}

type NavResource = { label: string; href: string }
type NavEntry = {
  module: string
  icon: ElementType
  href?: string
  resources?: NavResource[]
}

const ICON_MAP: Record<string, ElementType> = {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Shield,
}

function buildNavigation(rotas: RotaMenu[]): NavEntry[] {
  const sorted = [...rotas].sort((a, b) => a.ordem - b.ordem)
  const moduleMap = new Map<string, NavEntry>()

  for (const rota of sorted) {
    const icon = (rota.icone && ICON_MAP[rota.icone]) ?? LayoutDashboard

    if (!moduleMap.has(rota.modulo)) {
      moduleMap.set(rota.modulo, {
        module: rota.modulo,
        icon,
        resources: [],
      })
    }

    const entry = moduleMap.get(rota.modulo)!

    if (!entry.resources || entry.resources.length === 0) {
      entry.href = rota.rota
    } else {
      delete entry.href
    }

    if (rota.recurso !== rota.modulo) {
      entry.resources = entry.resources ?? []
      entry.resources.push({ label: rota.recurso, href: rota.rota })
    }
  }

  return Array.from(moduleMap.values()).map(e => {
    if (e.resources?.length === 1 && e.href) {
      return { module: e.module, icon: e.icon, href: e.href }
    }
    if (e.resources?.length === 0) {
      return { module: e.module, icon: e.icon, href: e.href }
    }
    return e
  })
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useLogout()
  const [openModule, setOpenModule] = useState<string | null>(null)

  if (!session) return null

  const navigation = buildNavigation(session.rotas ?? [])

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials(session.user.nome_completo)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{session.user.nome_completo}</p>
          <p className="truncate text-xs text-muted-foreground">Gerente</p>
          <p className="truncate text-xs text-muted-foreground">{session.hotel.nome_fantasia}</p>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navigation.map(entry => {
          const Icon = entry.icon
          const isExpanded = openModule === entry.module

          if (entry.href && (!entry.resources || entry.resources.length === 0)) {
            return (
              <NavLink
                key={entry.module}
                to={entry.href}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                    isActive && 'bg-accent font-medium',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {entry.module}
              </NavLink>
            )
          }

          return (
            <div key={entry.module}>
              <button
                type="button"
                onClick={() => setOpenModule(isExpanded ? null : entry.module)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{entry.module}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-90',
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isExpanded ? 'max-h-64' : 'max-h-0',
                )}
              >
                <div className="ml-4 flex flex-col gap-1 py-1">
                  {(entry.resources ?? []).map(resource => (
                    <NavLink
                      key={resource.href}
                      to={resource.href}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                          isActive && 'bg-accent font-medium text-foreground',
                        )
                      }
                    >
                      {resource.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="flex gap-1 border-t p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={logout} title="Encerrar sessão">
          <Power className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
