import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationsDropdown } from './notifications-dropdown'

interface TopNavbarProps {
  onMenuToggle: () => void
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto">
        <NotificationsDropdown />
      </div>
    </header>
  )
}
