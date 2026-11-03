import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

const Popover = ({ open: controlled_open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) => {
  const [uncontrolled_open, setUncontrolledOpen] = React.useState(false)
  const container_ref = React.useRef<HTMLDivElement>(null)
  const open = controlled_open ?? uncontrolled_open
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!open) return

    const handle_pointer_down = (event: PointerEvent) => {
      const target = event.target as Element | null
      const is_radix_portal = target?.closest(
        '[data-radix-popper-content-wrapper], [data-radix-select-content], [role="listbox"], [role="option"]',
      )
      if (
        !container_ref.current?.contains(event.target as Node) &&
        !is_radix_portal
      ) {
        setOpen(false)
      }
    }
    const handle_key_down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handle_pointer_down)
    document.addEventListener('keydown', handle_key_down)
    return () => {
      document.removeEventListener('pointerdown', handle_pointer_down)
      document.removeEventListener('keydown', handle_key_down)
    }
  }, [open])

  return <PopoverContext.Provider value={{ open, setOpen }}><div ref={container_ref} className="relative inline-block">{children}</div></PopoverContext.Provider>
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(({ asChild = false, onClick, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used inside Popover')
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} type={asChild ? undefined : 'button'} onClick={event => { onClick?.(event); if (!event.defaultPrevented) context.setOpen(!context.open) }} {...props} />
})
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context?.open) return null
  return <div ref={ref} role="dialog" className={cn('absolute right-0 top-full z-50 mt-2 min-w-[240px] rounded-md border bg-card p-4 text-card-foreground shadow-md outline-none', className)} {...props} />
})
PopoverContent.displayName = 'PopoverContent'

const PopoverClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ onClick, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverClose must be used inside Popover')
  return <button ref={ref} type="button" onClick={event => { onClick?.(event); if (!event.defaultPrevented) context.setOpen(false) }} {...props} />
})
PopoverClose.displayName = 'PopoverClose'

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
