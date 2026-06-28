import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/useLogout'
import { NotificationsDropdown } from './notifications-dropdown'

interface TopNavbarProps {
  onMenuToggle: () => void
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const { logout } = useLogout()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <NotificationsDropdown />
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
