import { LayoutDashboard, Settings } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import type { RotaMenu } from '@/types/auth'
import { buildNavigation } from './build_navigation'

function rota(
  partial: Partial<RotaMenu> & Pick<RotaMenu, 'modulo' | 'recurso' | 'rota'>
): RotaMenu {
  return { id: partial.rota, icone: null, ordem: 1, ...partial } as RotaMenu
}

function items(rotas: RotaMenu[], pathname = '/') {
  return buildNavigation(rotas, pathname).flatMap(section => section.items)
}

describe('buildNavigation', () => {
  it('turns a module with a single resource into a flat item labelled by the resource', () => {
    const [item] = items([
      rota({
        modulo: 'Geral',
        recurso: 'Dashboard',
        rota: '/dashboard',
        icone: 'LayoutDashboard',
      }),
    ])

    expect(item).toMatchObject({ label: 'Dashboard', href: '/dashboard' })
    expect(item.children).toBeUndefined()
  })

  it('groups several resources of a module into a group labelled by the module', () => {
    const [item] = items([
      rota({
        modulo: 'Reservas',
        recurso: 'Calendário',
        rota: '/reservas/calendario',
        ordem: 1,
      }),
      rota({
        modulo: 'Reservas',
        recurso: 'Lista',
        rota: '/reservas',
        ordem: 2,
      }),
    ])

    expect(item.label).toBe('Reservas')
    expect(item.href).toBeUndefined()
    expect(item.children?.map(child => child.label)).toEqual([
      'Calendário',
      'Lista',
    ])
  })

  it('sorts modules and resources by ordem', () => {
    const result = items([
      rota({ modulo: 'B', recurso: 'B1', rota: '/b', ordem: 5 }),
      rota({ modulo: 'A', recurso: 'A1', rota: '/a', ordem: 1 }),
    ])

    expect(result.map(item => item.label)).toEqual(['A1', 'B1'])
  })

  it('falls back to the dashboard icon for unknown or missing icons', () => {
    const result = items([
      rota({ modulo: 'A', recurso: 'A1', rota: '/a', icone: 'Nope', ordem: 1 }),
      rota({ modulo: 'B', recurso: 'B1', rota: '/b', icone: null, ordem: 2 }),
      rota({
        modulo: 'C',
        recurso: 'C1',
        rota: '/c',
        icone: 'Settings',
        ordem: 3,
      }),
    ])

    expect(result[0].icon).toBe(LayoutDashboard)
    expect(result[1].icon).toBe(LayoutDashboard)
    expect(result[2].icon).toBe(Settings)
  })

  it('marks only the most specific matching route as active', () => {
    const rotas = [
      rota({
        modulo: 'Reservas',
        recurso: 'Reservas',
        rota: '/reservas',
        ordem: 1,
      }),
      rota({
        modulo: 'Reservas',
        recurso: 'Orçamentos',
        rota: '/reservas/orcamentos',
        ordem: 2,
      }),
    ]

    const [group] = items(rotas, '/reservas/orcamentos/novo')
    expect(group.children?.map(child => child.active)).toEqual([false, true])

    const [other] = items(rotas, '/reservas')
    expect(other.children?.map(child => child.active)).toEqual([true, false])
  })

  it('does not treat a sibling prefix as active', () => {
    const [item] = items(
      [rota({ modulo: 'Q', recurso: 'Quartos', rota: '/quartos' })],
      '/quartos_extra'
    )

    expect(item.active).toBe(false)
  })

  it('returns no sections for no routes', () => {
    expect(buildNavigation([], '/')).toEqual([])
  })
})
