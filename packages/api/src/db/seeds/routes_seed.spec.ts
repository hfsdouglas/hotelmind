import { describe, expect, it, vi } from 'vitest'
import { BASE_ROUTES, seedRoutes } from './routes_seed'
import type { DB } from '@/lib/prisma'

describe('routes_seed', () => {
  it('defines the required base routes in correct order and structure', () => {
    // Reservas
    const reservas = BASE_ROUTES.filter(r => r.modulo === 'Reservas')
    expect(reservas).toEqual([
      { modulo: 'Reservas', recurso: 'Calendário', rota: '/reservas/calendario', icone: 'CalendarDays', ordem: 5 },
      { modulo: 'Reservas', recurso: 'Reservar', rota: '/reservas/novo', icone: 'CalendarDays', ordem: 6 },
      { modulo: 'Reservas', recurso: 'Consultar', rota: '/reservas', icone: 'CalendarDays', ordem: 7 },
    ])

    // 1. Quartos
    const quartos = BASE_ROUTES.filter(r => r.modulo === 'Quartos')
    expect(quartos).toEqual([
      { modulo: 'Quartos', recurso: 'Cadastrar', rota: '/quartos/novo', icone: 'BedDouble', ordem: 10 },
      { modulo: 'Quartos', recurso: 'Consultar', rota: '/quartos', icone: 'BedDouble', ordem: 11 },
      { modulo: 'Quartos', recurso: 'Categorias', rota: '/categorias_quartos', icone: 'BedDouble', ordem: 12 },
    ])

    // 2. Tarifários
    const tarifarios = BASE_ROUTES.filter(r => r.modulo === 'Tarifários')
    expect(tarifarios).toEqual([
      { modulo: 'Tarifários', recurso: 'Cadastrar', rota: '/tarifarios/novo', icone: 'CalendarRange', ordem: 20 },
      { modulo: 'Tarifários', recurso: 'Consultar', rota: '/tarifarios', icone: 'CalendarRange', ordem: 21 },
    ])

    // 3. Usuários
    const usuarios = BASE_ROUTES.filter(r => r.modulo === 'Usuários')
    expect(usuarios).toEqual([
      { modulo: 'Usuários', recurso: 'Cadastrar', rota: '/usuarios/novo', icone: 'Users', ordem: 30 },
      { modulo: 'Usuários', recurso: 'Consultar', rota: '/usuarios', icone: 'Users', ordem: 31 },
    ])

    // 4. Grupos
    const grupos = BASE_ROUTES.filter(r => r.modulo === 'Grupos')
    expect(grupos).toEqual([
      { modulo: 'Grupos', recurso: 'Cadastrar', rota: '/grupos/novo', icone: 'Shield', ordem: 40 },
      { modulo: 'Grupos', recurso: 'Consultar', rota: '/grupos', icone: 'Shield', ordem: 41 },
    ])

    // Dashboard
    const dashboard = BASE_ROUTES.find(r => r.rota === '/')
    expect(dashboard).toEqual({
      modulo: 'Dashboard',
      recurso: 'Dashboard',
      rota: '/',
      icone: 'LayoutDashboard',
      ordem: 0,
    })
  })

  it('ensures each route path is unique', () => {
    const paths = BASE_ROUTES.map(r => r.rota)
    const uniquePaths = new Set(paths)
    expect(paths.length).toBe(uniquePaths.size)
  })

  it('runs seedRoutes and synchronizes routes idempotently without destroying existing data', async () => {
    const mockDb = {
      rota: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `id-${data.rota}`, ...data })),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      hotel: {
        findMany: vi.fn().mockResolvedValue([{ id: 'hotel-1' }]),
      },
      rotaHotel: {
        findMany: vi.fn().mockResolvedValue([]),
        createMany: vi.fn().mockResolvedValue({ count: BASE_ROUTES.length }),
      },
      grupo: {
        findMany: vi.fn().mockResolvedValue([{ id: 'group-admin-1' }]),
      },
      grupoRota: {
        findMany: vi.fn().mockResolvedValue([]),
        createMany: vi.fn().mockResolvedValue({ count: BASE_ROUTES.length }),
      },
    } as unknown as DB

    const routes = await seedRoutes(mockDb)

    expect(routes).toHaveLength(BASE_ROUTES.length)
    expect(mockDb.rota.findFirst).toHaveBeenCalledTimes(BASE_ROUTES.length)
    expect(mockDb.rota.create).toHaveBeenCalledTimes(BASE_ROUTES.length)
    expect(mockDb.rota.updateMany).toHaveBeenCalled()
    expect(mockDb.rotaHotel.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ hotel_id: 'hotel-1' }),
      ]),
      skipDuplicates: true,
    })
    expect(mockDb.grupoRota.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ grupo_id: 'group-admin-1' }),
      ]),
      skipDuplicates: true,
    })
  })
})
