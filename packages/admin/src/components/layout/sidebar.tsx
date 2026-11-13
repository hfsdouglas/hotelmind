import { Avatar, AvatarFallback, Button, Separator } from '@hotelmind/ui'
import {
  Building2,
  LayoutDashboard,
  LifeBuoy,
  Moon,
  Network,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use_auth'
import { useLogout } from '@/hooks/use_logout'
import { useTheme } from '@/hooks/use_theme'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Hotéis', href: '/hoteis', icon: Building2 },
  { label: 'Rotas', href: '/rotas', icon: Network },
  { label: 'Administradores', href: '/administradores', icon: ShieldCheck },
  { label: 'Suporte', href: '/suporte', icon: LifeBuoy },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
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

  if (!session) return null

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback>
              {initials(session.admin.nome_completo)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {session.admin.nome_completo}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Administrador
            </p>
            {/* biome-ignore lint/a11y/useValidAnchor: tag <a> explicitamente solicitada para o link de Sair */}
            <a
              href="#logout"
              onClick={e => {
                e.preventDefault()
                logout()
              }}
              className="block w-fit cursor-pointer text-xs text-muted-foreground underline transition-colors hover:text-foreground"
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
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive && 'bg-accent font-medium'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
