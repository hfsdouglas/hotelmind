import { NavLink, useLocation } from 'react-router-dom'
import { Building2, LayoutDashboard, Network, Power, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Hotéis', href: '/hoteis', icon: Building2 },
  { label: 'Rotas', href: '/rotas', icon: Network },
  { label: 'Administradores', href: '/administradores', icon: ShieldCheck },
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
  const { logout } = useLogout()
  const { pathname } = useLocation()

  if (!session) return null

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials(session.admin.nome_completo)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{session.admin.nome_completo}</p>
          <p className="truncate text-xs text-muted-foreground">Administrador</p>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

          return (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive && 'bg-accent font-medium',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button variant="ghost" size="icon" onClick={logout} title="Encerrar sessão">
          <Power className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
