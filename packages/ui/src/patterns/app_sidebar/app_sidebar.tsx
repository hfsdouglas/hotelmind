import {
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react'
import {
  type ComponentType,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../components/tooltip/tooltip'
import { cn } from '../../lib/cn'

export interface NavBadge {
  count: number
  tone: 'destructive' | 'warning'
  /** Accessible text, e.g. "3 notificações não lidas". */
  label: string
}

export interface NavItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>
  href?: string
  /** Computed by the app from the current pathname. */
  active?: boolean
  disabled?: boolean
  badge?: NavBadge
  /** Turns the item into a collapsible group. */
  children?: NavItem[]
}

export interface NavSection {
  id: string
  label?: string
  items: NavItem[]
}

export interface RenderLinkProps {
  to: string
  className: string
  onClick?: MouseEventHandler<HTMLElement>
  'aria-current'?: 'page'
  children: ReactNode
}

/** The app injects its router link so this package stays router-free. */
export type RenderLink = (props: RenderLinkProps) => ReactNode

export interface AppSidebarProps {
  /** Id of the element controlled by the collapse button. */
  id: string
  brand: ReactNode
  brandCollapsed?: ReactNode
  sections: NavSection[]
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Hides the collapse button (mobile drawer). */
  hideCollapseToggle?: boolean
  mobile?: boolean
  renderLink: RenderLink
  onNavigate?: () => void
  footer?: ReactNode
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar'

export function sidebarItemClass({
  collapsed = false,
  active = false,
  mobile = false,
  nested = false,
}: {
  collapsed?: boolean
  active?: boolean
  mobile?: boolean
  nested?: boolean
} = {}) {
  return cn(
    'flex w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors motion-reduce:transition-none',
    mobile ? 'h-11' : 'h-10',
    nested && 'h-9',
    collapsed && 'justify-center',
    active
      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sidebar-active dark:shadow-none'
      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    FOCUS_RING
  )
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function has_active(item: NavItem): boolean {
  return Boolean(item.active) || (item.children ?? []).some(has_active)
}

function filter_item(item: NavItem, query: string): NavItem | null {
  if (normalize(item.label).includes(query)) return item
  const children = (item.children ?? []).filter(child =>
    normalize(child.label).includes(query)
  )
  return children.length > 0 ? { ...item, children } : null
}

function filter_sections(sections: NavSection[], query: string) {
  if (!query) return sections
  return sections
    .map(section => {
      if (section.label && normalize(section.label).includes(query)) {
        return section
      }
      const items = section.items
        .map(item => filter_item(item, query))
        .filter((item): item is NavItem => item !== null)
      return { ...section, items }
    })
    .filter(section => section.items.length > 0)
}

function CollapsedTooltip({
  enabled,
  label,
  children,
}: {
  enabled: boolean
  label: string
  children: ReactElement
}) {
  if (!enabled) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function ItemBadge({
  badge,
  collapsed,
}: {
  badge: NavBadge
  collapsed: boolean
}) {
  const tone =
    badge.tone === 'destructive'
      ? 'bg-destructive text-destructive-foreground'
      : 'bg-warning text-warning-foreground'
  return (
    <>
      {collapsed ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -right-1 -top-1 size-2.5 rounded-full ring-2 ring-sidebar',
            tone
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
            tone
          )}
        >
          {badge.count > 99 ? '99+' : badge.count}
        </span>
      )}
      <span className="sr-only">{badge.label}</span>
    </>
  )
}

function ItemContent({
  item,
  collapsed,
  trailing,
}: {
  item: NavItem
  collapsed: boolean
  trailing?: ReactNode
}) {
  const Icon = item.icon
  return (
    <>
      <span className="relative flex shrink-0">
        <Icon className="size-5" aria-hidden="true" />
        {collapsed && item.badge && <ItemBadge badge={item.badge} collapsed />}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-left transition-opacity duration-150 motion-reduce:transition-none',
          collapsed && 'sr-only'
        )}
      >
        {item.label}
      </span>
      {!collapsed && item.badge && (
        <ItemBadge badge={item.badge} collapsed={false} />
      )}
      {!collapsed && trailing}
    </>
  )
}

interface ItemProps {
  item: NavItem
  collapsed: boolean
  mobile: boolean
  nested?: boolean
  renderLink: RenderLink
  onNavigate?: () => void
}

function SidebarLinkItem({
  item,
  collapsed,
  mobile,
  nested,
  renderLink,
  onNavigate,
}: ItemProps) {
  const className = sidebarItemClass({
    collapsed,
    active: item.active,
    mobile,
    nested,
  })

  if (item.disabled || !item.href) {
    return (
      <CollapsedTooltip enabled={collapsed} label={item.label}>
        <span
          aria-disabled="true"
          className={cn(className, 'pointer-events-none opacity-50')}
        >
          <ItemContent item={item} collapsed={collapsed} />
        </span>
      </CollapsedTooltip>
    )
  }

  const link = renderLink({
    to: item.href,
    className,
    onClick: onNavigate,
    'aria-current': item.active ? 'page' : undefined,
    children: <ItemContent item={item} collapsed={collapsed} />,
  })

  return (
    <CollapsedTooltip enabled={collapsed} label={item.label}>
      {link as ReactElement}
    </CollapsedTooltip>
  )
}

function SidebarGroupItem({
  item,
  collapsed,
  mobile,
  renderLink,
  onNavigate,
  open,
  onToggle,
  group_id,
}: ItemProps & { open: boolean; onToggle: () => void; group_id: string }) {
  const [flyout_open, setFlyoutOpen] = useState(false)
  const children = item.children ?? []
  const active = has_active(item)

  if (collapsed) {
    return (
      <Popover open={flyout_open} onOpenChange={setFlyoutOpen}>
        <CollapsedTooltip enabled label={item.label}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={sidebarItemClass({ collapsed, active, mobile })}
            >
              <ItemContent item={item} collapsed />
            </button>
          </PopoverTrigger>
        </CollapsedTooltip>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={12}
          aria-label={item.label}
          className="w-56 border-sidebar-border bg-sidebar p-2 text-sidebar-foreground"
        >
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground">
            {item.label}
          </p>
          <ul className="flex flex-col gap-1">
            {children.map(child => (
              <li key={child.id}>
                <SidebarLinkItem
                  item={child}
                  collapsed={false}
                  mobile={false}
                  nested
                  renderLink={renderLink}
                  onNavigate={() => {
                    setFlyoutOpen(false)
                    onNavigate?.()
                  }}
                />
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={group_id}
        onClick={onToggle}
        className={cn(sidebarItemClass({ mobile }), active && 'font-semibold')}
      >
        <ItemContent
          item={item}
          collapsed={false}
          trailing={
            <ChevronRight
              aria-hidden="true"
              className={cn(
                'size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none',
                open && 'rotate-90'
              )}
            />
          }
        />
      </button>
      <ul
        id={group_id}
        hidden={!open}
        className="ml-[22px] mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-2"
      >
        {children.map(child => (
          <li key={child.id}>
            <SidebarLinkItem
              item={child}
              collapsed={false}
              mobile={mobile}
              nested
              renderLink={renderLink}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AppSidebar({
  id,
  brand,
  brandCollapsed,
  sections,
  collapsed,
  onToggleCollapsed,
  hideCollapseToggle = false,
  mobile = false,
  renderLink,
  onNavigate,
  footer,
}: AppSidebarProps) {
  const [query, setQuery] = useState('')
  const input_ref = useRef<HTMLInputElement>(null)
  const focus_after_expand = useRef(false)

  const active_group_ids = useMemo(
    () =>
      sections
        .flatMap(section => section.items)
        .filter(item => item.children && has_active(item))
        .map(item => item.id),
    [sections]
  )
  const active_key = active_group_ids.join('|')
  const [open_groups, setOpenGroups] = useState<Set<string>>(
    () => new Set(active_group_ids)
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: opens the group of the current route only when that route changes
  useEffect(() => {
    if (active_group_ids.length === 0) return
    setOpenGroups(previous => new Set([...previous, ...active_group_ids]))
  }, [active_key])

  useEffect(() => {
    if (!collapsed && focus_after_expand.current) {
      focus_after_expand.current = false
      input_ref.current?.focus()
    }
  }, [collapsed])

  const normalized_query = normalize(query)
  const visible_sections = useMemo(
    () => filter_sections(sections, normalized_query),
    [sections, normalized_query]
  )

  function toggle_group(group_id: string) {
    setOpenGroups(previous => {
      const next = new Set(previous)
      if (next.has(group_id)) next.delete(group_id)
      else next.add(group_id)
      return next
    })
  }

  const toggle_label = collapsed ? 'Expandir menu' : 'Recolher menu'
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div className="flex h-full min-h-0 flex-col text-sidebar-foreground">
      <div
        className={cn(
          'flex shrink-0 items-center gap-2 px-3',
          collapsed ? 'flex-col py-3' : 'h-16 justify-between'
        )}
      >
        <div className="flex min-w-0 items-center">
          {collapsed ? (brandCollapsed ?? brand) : brand}
        </div>
        {!hideCollapseToggle && (
          <CollapsedTooltip enabled={collapsed} label={toggle_label}>
            <button
              type="button"
              aria-label={toggle_label}
              aria-controls={id}
              onClick={onToggleCollapsed}
              className={cn(
                'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground motion-reduce:transition-none',
                FOCUS_RING
              )}
            >
              <ToggleIcon className="size-5" aria-hidden="true" />
            </button>
          </CollapsedTooltip>
        )}
      </div>

      <div className="shrink-0 px-3 pb-2">
        {collapsed ? (
          <CollapsedTooltip enabled label="Buscar no menu">
            <button
              type="button"
              aria-label="Buscar no menu"
              onClick={() => {
                focus_after_expand.current = true
                onToggleCollapsed()
              }}
              className={sidebarItemClass({ collapsed: true, mobile })}
            >
              <Search className="size-5" aria-hidden="true" />
            </button>
          </CollapsedTooltip>
        ) : (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={input_ref}
              type="search"
              aria-label="Filtrar menu"
              placeholder="Buscar no menu"
              value={query}
              onChange={event => setQuery(event.target.value)}
              className={cn(
                'h-10 w-full rounded-lg border border-sidebar-border bg-transparent pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-muted-foreground',
                FOCUS_RING
              )}
            />
          </div>
        )}
      </div>

      <nav
        aria-label="Navegação principal"
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
      >
        {visible_sections.length === 0 && (
          <p
            role="status"
            className="px-3 py-6 text-center text-sm text-sidebar-muted-foreground"
          >
            Nenhum item encontrado
          </p>
        )}
        {visible_sections.map((section, index) => {
          const heading_id = `${id}-section-${section.id}`
          return (
            <div key={section.id}>
              {section.label &&
                (collapsed ? (
                  index > 0 && (
                    <div
                      aria-hidden="true"
                      className="my-4 h-px bg-sidebar-border"
                    />
                  )
                ) : (
                  <p
                    id={heading_id}
                    className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground"
                  >
                    {section.label}
                  </p>
                ))}
              {!section.label && index > 0 && (
                <div
                  aria-hidden="true"
                  className="my-4 h-px bg-sidebar-border"
                />
              )}
              <ul
                aria-labelledby={
                  section.label && !collapsed ? heading_id : undefined
                }
                aria-label={
                  section.label && collapsed ? section.label : undefined
                }
                className="flex flex-col gap-1"
              >
                {section.items.map(item => (
                  <li key={item.id}>
                    {item.children && item.children.length > 0 ? (
                      <SidebarGroupItem
                        item={item}
                        collapsed={collapsed}
                        mobile={mobile}
                        renderLink={renderLink}
                        onNavigate={onNavigate}
                        open={
                          normalized_query ? true : open_groups.has(item.id)
                        }
                        onToggle={() => toggle_group(item.id)}
                        group_id={`${id}-group-${item.id}`}
                      />
                    ) : (
                      <SidebarLinkItem
                        item={item}
                        collapsed={collapsed}
                        mobile={mobile}
                        renderLink={renderLink}
                        onNavigate={onNavigate}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      {footer && (
        <div className="shrink-0 border-t border-sidebar-border p-3">
          {footer}
        </div>
      )}
    </div>
  )
}
