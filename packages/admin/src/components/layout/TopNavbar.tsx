import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopNavbarProps {
  onMenuToggle: () => void
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  return (
    <header className="flex h-14 items-center border-b bg-card px-4">
      <Button variant="ghost" size="icon" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>
      <span className="ml-2 font-semibold text-sm">HotelMind Admin</span>
    </header>
  )
}
