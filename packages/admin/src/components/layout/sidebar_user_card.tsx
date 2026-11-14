import {
  SidebarUserCard as UiSidebarUserCard,
  type UserMenuItem,
} from '@hotelmind/ui'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/use_auth'
import { useLogout } from '@/hooks/use_logout'
import { useTheme } from '@/hooks/use_theme'

interface SidebarUserCardProps {
  collapsed: boolean
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useLogout()

  if (!session) return null

  const items: UserMenuItem[] = [
    {
      id: 'tema',
      label: theme === 'dark' ? 'Modo claro' : 'Modo escuro',
      icon: theme === 'dark' ? Sun : Moon,
      onSelect: toggleTheme,
    },
    {
      id: 'sair',
      label: 'Sair',
      icon: LogOut,
      destructive: true,
      separatorBefore: true,
      onSelect: logout,
    },
  ]

  return (
    <UiSidebarUserCard
      name={session.admin.nome_completo}
      secondary="Administrador"
      collapsed={collapsed}
      items={items}
    />
  )
}
