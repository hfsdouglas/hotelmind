import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(p => !p)}
        aria-label="Notificações"
        className="text-primary-foreground hover:bg-primary-deep dark:hover:bg-primary-deeper hover:text-primary-foreground"
      >
        <Bell className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border bg-popover text-popover-foreground p-2 shadow-md">
          <p className="px-2 py-1 text-sm font-medium">Notificações</p>
          <Separator className="my-1" />
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Nenhuma notificação.
          </p>
        </div>
      )}
    </div>
  )
}
