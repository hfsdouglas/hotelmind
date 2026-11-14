import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useId, useState } from 'react'
import { cn } from '../../lib/cn'
import {
  AppSidebar,
  type NavSection,
  type RenderLink,
} from '../app_sidebar/app_sidebar'

export interface AppShellProps {
  /** localStorage key that persists the collapsed preference. */
  storageKey: string
  variant?: 'default' | 'brand'
  brand: ReactNode
  brandCollapsed?: ReactNode
  /** Logo shown in the mobile bar and drawer (defaults to `brand`). */
  mobileBrand?: ReactNode
  sections: NavSection[]
  footer?: (context: { collapsed: boolean }) => ReactNode
  topBanner?: ReactNode
  mobileActions?: ReactNode
  renderLink: RenderLink
  children: ReactNode
}

const WIDE_QUERY = '(min-width: 1280px)'

function read_stored(key: string): boolean | null {
  try {
    const value = window.localStorage.getItem(key)
    if (value === 'true') return true
    if (value === 'false') return false
  } catch {
    // storage unavailable: fall back to the width default
  }
  return null
}

function write_stored(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // storage unavailable: the preference lasts for this session only
  }
}

function is_wide() {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia(WIDE_QUERY).matches
}

function useCollapsed(storage_key: string) {
  const [preference, setPreference] = useState<boolean | null>(() =>
    read_stored(storage_key)
  )
  const [wide, setWide] = useState(is_wide)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(WIDE_QUERY)
    const on_change = (event: MediaQueryListEvent) => setWide(event.matches)
    query.addEventListener?.('change', on_change)
    return () => query.removeEventListener?.('change', on_change)
  }, [])

  const collapsed = preference ?? !wide
  const toggle = useCallback(() => {
    const next = !collapsed
    setPreference(next)
    write_stored(storage_key, next)
  }, [collapsed, storage_key])

  return { collapsed, toggle }
}

export function AppShell({
  storageKey,
  variant = 'default',
  brand,
  brandCollapsed,
  mobileBrand,
  sections,
  footer,
  topBanner,
  mobileActions,
  renderLink,
  children,
}: AppShellProps) {
  const { collapsed, toggle } = useCollapsed(storageKey)
  const [mobile_open, setMobileOpen] = useState(false)
  const base_id = useId()
  const sidebar_id = `${base_id}-sidebar`
  const drawer_id = `${base_id}-drawer`
  const variant_attr = variant === 'brand' ? 'brand' : undefined
  const mobile_logo = mobileBrand ?? brand

  return (
    <DialogPrimitive.Root open={mobile_open} onOpenChange={setMobileOpen}>
      <div
        data-sidebar-variant={variant_attr}
        className="flex h-dvh overflow-hidden bg-background text-foreground"
      >
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>

        <aside
          id={sidebar_id}
          aria-label="Menu principal"
          className={cn(
            'hidden shrink-0 p-2 transition-[width] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none md:block',
            collapsed ? 'w-[5.5rem]' : 'w-[17rem]'
          )}
        >
          <div className="h-full overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-sidebar-panel dark:shadow-none">
            <AppSidebar
              id={sidebar_id}
              brand={brand}
              brandCollapsed={brandCollapsed}
              sections={sections}
              collapsed={collapsed}
              onToggleCollapsed={toggle}
              renderLink={renderLink}
              footer={footer?.({ collapsed })}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {topBanner}

          <div className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-2 md:hidden">
            <DialogPrimitive.Trigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </DialogPrimitive.Trigger>
            <div className="flex min-w-0 items-center">{mobile_logo}</div>
            <div className="ml-auto flex items-center">{mobileActions}</div>
          </div>

          <main
            id="conteudo-principal"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 focus:outline-none md:p-6"
          >
            {children}
          </main>
        </div>

        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
          <DialogPrimitive.Content
            id={drawer_id}
            data-sidebar-variant={variant_attr}
            aria-describedby={undefined}
            onClick={event => {
              if ((event.target as HTMLElement).closest('a[href]')) {
                setMobileOpen(false)
              }
            }}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-sidebar-panel focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left motion-reduce:animate-none md:hidden"
          >
            <DialogPrimitive.Title className="sr-only">
              Menu principal
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Fechar menu"
              className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-lg text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
            <AppSidebar
              id={`${drawer_id}-nav`}
              brand={mobile_logo}
              sections={sections}
              collapsed={false}
              onToggleCollapsed={toggle}
              hideCollapseToggle
              mobile
              renderLink={renderLink}
              onNavigate={() => setMobileOpen(false)}
              footer={footer?.({ collapsed: false })}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </div>
    </DialogPrimitive.Root>
  )
}
