import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationsDropdown } from './notifications-dropdown'

interface TopNavbarProps {
  onMenuToggle: () => void
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-primary-deeper bg-primary text-primary-foreground px-4 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        aria-label="Menu"
        className="text-primary-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto">
        <NotificationsDropdown />
      </div>
    </header>
  )
}
