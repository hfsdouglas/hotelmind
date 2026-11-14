import type { NavItem, NavSection } from '@hotelmind/ui'
import {
  BedDouble,
  Calculator,
  CalendarDays,
  CalendarRange,
  Handshake,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import type { RotaMenu } from '@/types/auth'

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  BedDouble,
  Users,
  Shield,
  Calculator,
  Handshake,
  Settings,
}

function matches(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Builds the sidebar sections from the routes saved at login: grouped by
 * `modulo`, sorted by `ordem`. A module with a single resource becomes a flat
 * item labelled by the resource. Only the most specific route is `active`.
 */
export function buildNavigation(
  rotas: RotaMenu[],
  pathname: string
): NavSection[] {
  const sorted = [...rotas].sort((a, b) => a.ordem - b.ordem)
  if (sorted.length === 0) return []

  const active_href = sorted
    .map(rota => rota.rota)
    .filter(href => matches(pathname, href))
    .sort((a, b) => b.length - a.length)[0]

  const modules = new Map<string, RotaMenu[]>()
  for (const rota of sorted) {
    modules.set(rota.modulo, [...(modules.get(rota.modulo) ?? []), rota])
  }

  const items: NavItem[] = Array.from(modules, ([modulo, resources]) => {
    const icon_of = (rota: RotaMenu) =>
      (rota.icone ? ICON_MAP[rota.icone] : undefined) ?? LayoutDashboard

    if (resources.length === 1) {
      const [rota] = resources
      return {
        id: rota.id,
        label: rota.recurso,
        icon: icon_of(rota),
        href: rota.rota,
        active: rota.rota === active_href,
      }
    }

    return {
      id: `modulo-${modulo}`,
      label: modulo,
      icon: icon_of(resources[0]),
      children: resources.map(rota => ({
        id: rota.id,
        label: rota.recurso,
        icon: icon_of(rota),
        href: rota.rota,
        active: rota.rota === active_href,
      })),
    }
  })

  return [{ id: 'menu', items }]
}
