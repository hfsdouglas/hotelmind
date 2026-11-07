import {
  BedDouble,
  Calculator,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Handshake,
  LayoutDashboard,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/hooks/useLogout'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import type { RotaMenu } from '@/types/auth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
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
  CalendarRange,
  BedDouble,
  Users,
  Shield,
  Calculator,
  Handshake,
  Settings,
}

function buildNavigation(rotas: RotaMenu[]): NavEntry[] {
  const sorted = [...rotas].sort((a, b) => a.ordem - b.ordem)
  const moduleMap = new Map<string, NavEntry>()

  for (const rota of sorted) {
    const icon =
      (rota.icone ? ICON_MAP[rota.icone] : undefined) ?? LayoutDashboard

    if (!moduleMap.has(rota.modulo)) {
      moduleMap.set(rota.modulo, {
        module: rota.modulo,
        icon,
        resources: [],
      })
    }

    const entry = moduleMap.get(rota.modulo)!
    entry.resources = entry.resources ?? []
    entry.resources.push({ label: rota.recurso, href: rota.rota })
  }

  return Array.from(moduleMap.values()).map(e => {
    if (e.resources?.length === 1 && e.resources[0].href === '/') {
      return { module: e.module, icon: e.icon, href: e.resources[0].href }
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useLogout()
  const { pathname } = useLocation()
  const [openModule, setOpenModule] = useState<string | null>(null)

  if (!session) return null

  const navigation = buildNavigation(session.rotas ?? [])

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-primary bg-primary-deep text-primary-foreground transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between border-b border-primary bg-primary-deeper p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">
              {initials(session.user.nome_completo)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-accent-foreground">
              {session.user.nome_completo}
            </p>
            <p className="truncate text-xs text-primary-foreground/80">
              Gerente
            </p>
            <p className="truncate text-xs text-primary-foreground/80">
              {session.hotel.nome_fantasia}
            </p>
            {/* biome-ignore lint/a11y/useValidAnchor: tag <a> explicitamente solicitada para o link de Sair */}
            <a
              href="#logout"
              onClick={e => {
                e.preventDefault()
                logout()
              }}
              className="block w-fit cursor-pointer text-xs text-primary-foreground/70 underline transition-colors hover:text-primary-foreground"
            >
              Sair
            </a>
          </div>
        </div>
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            className="size-8 shrink-0 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-darkest"
          >
            {theme === 'dark' ? (
              <Sun
                className="h-4 w-4"
                style={{ animation: 'themeToggle 0.5s ease-in-out' }}
              />
            ) : (
              <Moon
                className="h-4 w-4"
                style={{ animation: 'themeToggle 0.5s ease-in-out' }}
              />
            )}
          </Button>
        </div>
      </div>

      <Separator className="bg-primary" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navigation.map(entry => {
          const Icon = entry.icon
          const isExpanded = openModule === entry.module

          if (
            entry.href &&
            (!entry.resources || entry.resources.length === 0)
          ) {
            return (
              <NavLink
                key={entry.module}
                to={entry.href}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-primary-foreground/80 hover:bg-primary-deeper hover:text-primary-foreground',
                    isActive &&
                      'bg-primary-deeper font-medium text-primary-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {entry.module}
              </NavLink>
            )
          }

          const hasActiveChild = (entry.resources ?? []).some(
            r => r.href === pathname
          )

          return (
            <div key={entry.module}>
              <button
                type="button"
                onClick={() => setOpenModule(isExpanded ? null : entry.module)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-primary-foreground/80 hover:bg-primary-deeper hover:text-primary-foreground',
                  (hasActiveChild || isExpanded) &&
                    'bg-primary-deeper font-medium text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{entry.module}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isExpanded ? 'max-h-64' : 'max-h-0'
                )}
              >
                <div className="ml-4 flex flex-col gap-1 py-1">
                  {(entry.resources ?? []).map(resource => (
                    <NavLink
                      key={resource.href}
                      to={resource.href}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-md px-3 py-1.5 text-sm transition-colors text-primary-foreground/70 hover:bg-primary-darkest hover:text-primary-foreground',
                          isActive &&
                            'bg-primary-darkest/70 font-medium text-primary-foreground'
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
    </aside>
  )
}
