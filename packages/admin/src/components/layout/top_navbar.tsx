import { Button, SuiteSyncLogo } from '@hotelmind/ui'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TopNavbarProps {
  onMenuToggle: () => void
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  return (
    <header className="flex h-14 items-center border-b bg-card px-4">
      <Button variant="ghost" size="icon" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>
      <Link
        to="/"
        aria-label="SuiteSync Admin — Ir para o dashboard"
        className="ml-2 inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SuiteSyncLogo size="sm" badge="ADMIN" />
      </Link>
    </header>
  )
}
