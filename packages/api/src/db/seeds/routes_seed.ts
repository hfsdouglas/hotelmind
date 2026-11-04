import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { type DB, db } from '@/lib/prisma'

export interface RouteSeedItem {
  modulo: string
  recurso: string
  rota: string
  icone: string
  ordem: number
}

export const BASE_ROUTES: RouteSeedItem[] = [
  {
    modulo: 'Dashboard',
    recurso: 'Dashboard',
    rota: '/',
    icone: 'LayoutDashboard',
    ordem: 0,
  },
  {
    modulo: 'Reservas',
    recurso: 'Calendário',
    rota: '/reservas/calendario',
    icone: 'CalendarDays',
    ordem: 5,
  },
  {
    modulo: 'Reservas',
    recurso: 'Reservar',
    rota: '/reservas/novo',
    icone: 'CalendarDays',
    ordem: 6,
  },
  {
    modulo: 'Reservas',
    recurso: 'Consultar',
    rota: '/reservas',
    icone: 'CalendarDays',
    ordem: 7,
  },
  {
    modulo: 'Quartos',
    recurso: 'Cadastrar',
    rota: '/quartos/novo',
    icone: 'BedDouble',
    ordem: 10,
  },
  {
    modulo: 'Quartos',
    recurso: 'Consultar',
    rota: '/quartos',
    icone: 'BedDouble',
    ordem: 11,
  },
  {
    modulo: 'Quartos',
    recurso: 'Categorias',
    rota: '/categorias_quartos',
    icone: 'BedDouble',
    ordem: 12,
  },
  {
    modulo: 'Tarifários',
    recurso: 'Cadastrar',
    rota: '/tarifarios/novo',
    icone: 'CalendarRange',
    ordem: 20,
  },
  {
    modulo: 'Tarifários',
    recurso: 'Consultar',
    rota: '/tarifarios',
    icone: 'CalendarRange',
    ordem: 21,
  },
  {
    modulo: 'Tarifários',
    recurso: 'Regimes de Alimentação',
    rota: '/regimes_alimentacao',
    icone: 'CalendarRange',
    ordem: 22,
  },
  {
    modulo: 'Usuários',
    recurso: 'Cadastrar',
    rota: '/usuarios/novo',
    icone: 'Users',
    ordem: 30,
  },
  {
    modulo: 'Usuários',
    recurso: 'Consultar',
    rota: '/usuarios',
    icone: 'Users',
    ordem: 31,
  },
  {
    modulo: 'Grupos',
    recurso: 'Cadastrar',
    rota: '/grupos/novo',
    icone: 'Shield',
    ordem: 40,
  },
  {
    modulo: 'Grupos',
    recurso: 'Consultar',
    rota: '/grupos',
    icone: 'Shield',
    ordem: 41,
  },
]

export async function seedRoutes(client: DB = db) {
  console.log('Iniciando sincronização do seed de rotas...')

  const activeRoutes = []

  // 1. Sincroniza cada rota do catálogo BASE_ROUTES
  for (const item of BASE_ROUTES) {
    const existing = await client.rota.findFirst({
      where: { rota: item.rota },
    })

    if (existing) {
      const updated = await client.rota.update({
        where: { id: existing.id },
        data: {
          modulo: item.modulo,
          recurso: item.recurso,
          icone: item.icone,
          ordem: item.ordem,
          ativo: true,
        },
      })
      activeRoutes.push(updated)
    } else {
      const created = await client.rota.create({
        data: {
          modulo: item.modulo,
          recurso: item.recurso,
          rota: item.rota,
          icone: item.icone,
          ordem: item.ordem,
          ativo: true,
        },
      })
      activeRoutes.push(created)
    }
  }

  // 2. Desativa rotas que não pertencem mais ao catálogo oficial
  const basePaths = BASE_ROUTES.map(r => r.rota)
  const deactivated = await client.rota.updateMany({
    where: {
      rota: { notIn: basePaths },
      ativo: true,
    },
    data: {
      ativo: false,
    },
  })

  if (deactivated.count > 0) {
    console.log(`Rotas obsoletas desativadas: ${deactivated.count}`)
  }

  // 3. Sincroniza com hotéis existentes (seguro para dev e produção)
  const hotels = await client.hotel.findMany({ select: { id: true } })
  console.log(`Sincronizando rotas com ${hotels.length} hotel(is)...`)

  for (const hotel of hotels) {
    // Vincular todas as rotas ativas ao hotel em RotaHotel
    const existingHotelRoutes = await client.rotaHotel.findMany({
      where: { hotel_id: hotel.id },
      select: { rota_id: true },
    })
    const existingRouteIds = new Set(existingHotelRoutes.map(hr => hr.rota_id))

    const missingForHotel = activeRoutes
      .filter(r => !existingRouteIds.has(r.id))
      .map(r => ({ hotel_id: hotel.id, rota_id: r.id }))

    if (missingForHotel.length > 0) {
      await client.rotaHotel.createMany({
        data: missingForHotel,
        skipDuplicates: true,
      })
    }

    // Vincular rotas ativas ao grupo "Administrador" do hotel se existir
    const adminGroups = await client.grupo.findMany({
      where: { hotel_id: hotel.id, grupo: 'Administrador' },
      select: { id: true },
    })

    for (const group of adminGroups) {
      const existingGroupRoutes = await client.grupoRota.findMany({
        where: { grupo_id: group.id },
        select: { rota_id: true },
      })
      const existingGroupRouteIds = new Set(
        existingGroupRoutes.map(gr => gr.rota_id)
      )

      const missingForGroup = activeRoutes
        .filter(r => !existingGroupRouteIds.has(r.id))
        .map(r => ({ grupo_id: group.id, rota_id: r.id }))

      if (missingForGroup.length > 0) {
        await client.grupoRota.createMany({
          data: missingForGroup,
          skipDuplicates: true,
        })
      }
    }
  }

  console.log(
    `Seed de rotas finalizado com sucesso! ${activeRoutes.length} rotas ativas.`
  )
  return activeRoutes
}

const is_direct_run =
  Boolean(process.argv[1]) &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('routes_seed.ts') ||
    process.argv[1].endsWith('routes_seed.js'))

if (is_direct_run) {
  seedRoutes()
    .then(() => {
      console.log('Seed de rotas executado com êxito.')
    })
    .catch(error => {
      console.error('Falha ao rodar seed de rotas:', error)
      process.exit(1)
    })
    .finally(() => db.$disconnect())
}
