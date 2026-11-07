import { type DB, db } from '@/lib/prisma'
import type { SeedAcomodacoesResult } from './acomodacoes_seed'
import type { SeedParceirosResult } from './parceiros_seed'
import type { SeedRegimesResult } from './regimes_seed'

function build_year_dates_by_schedule(year: number): {
  weekday_dates: Date[]
  weekend_dates: Date[]
} {
  const weekday_dates: Date[] = []
  const weekend_dates: Date[] = []

  const cursor = new Date(Date.UTC(year, 0, 1))
  while (cursor.getUTCFullYear() === year) {
    const date = new Date(cursor.getTime())
    const day_of_week = date.getUTCDay()
    // Na hotelaria: Fim de semana = Sexta (5) e Sábado (6)
    // Dias de semana = Domingo (0) à Quinta-feira (4)
    if (day_of_week === 5 || day_of_week === 6) {
      weekend_dates.push(date)
    } else {
      weekday_dates.push(date)
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return { weekday_dates, weekend_dates }
}

export async function seedTarifarios(
  hotel_id: string,
  acomodacoes: SeedAcomodacoesResult,
  regimes: SeedRegimesResult,
  parceiros: SeedParceirosResult,
  client: DB = db
) {
  console.log(
    '[DEV] Semeando tarifários públicos e tarifários vinculados a parceiros...'
  )

  const current_year = new Date().getUTCFullYear()
  const { weekday_dates, weekend_dates } =
    build_year_dates_by_schedule(current_year)

  const { categorias } = acomodacoes
  const cat_luxo = categorias[0]
  const cat_super_luxo = categorias[1]
  const cat_master = categorias[2]
  const cat_presidencial = categorias[3]

  // 1. TARIFÁRIOS PÚBLICOS GERAIS (Balcão / Sem Parceiro)
  const public_plans = [
    {
      category: cat_luxo,
      regime: regimes.cafe,
      weekday_rate: '450.00',
      weekend_rate: '650.00',
    },
    {
      category: cat_super_luxo,
      regime: regimes.cafe,
      weekday_rate: '600.00',
      weekend_rate: '850.00',
    },
    {
      category: cat_master,
      regime: regimes.cafe,
      weekday_rate: '850.00',
      weekend_rate: '1200.00',
    },
    {
      category: cat_presidencial,
      regime: regimes.all_inclusive,
      weekday_rate: '1800.00',
      weekend_rate: '2500.00',
    },
  ]

  for (const plan of public_plans) {
    await client.tarifario.create({
      data: {
        hotel_id,
        parceiro_id: null,
        categoria_quarto_id: plan.category.id,
        regime_alimentacao_id: plan.regime.id,
        nome: `Público - ${plan.category.nome} (Dias de semana)`,
        valor_diaria: plan.weekday_rate,
        ativo: true,
        datas: {
          createMany: {
            data: weekday_dates.map(data => ({ data })),
          },
        },
      },
    })

    await client.tarifario.create({
      data: {
        hotel_id,
        parceiro_id: null,
        categoria_quarto_id: plan.category.id,
        regime_alimentacao_id: plan.regime.id,
        nome: `Público - ${plan.category.nome} (Fins de semana)`,
        valor_diaria: plan.weekend_rate,
        ativo: true,
        datas: {
          createMany: {
            data: weekend_dates.map(data => ({ data })),
          },
        },
      },
    })
  }

  // 2. TARIFÁRIOS VINCULADOS A PARCEIROS COMERCIAIS

  // A) Petrobras (Corporativo com desconto negociado em Suítes Luxo e Master)
  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.petrobras.id,
      categoria_quarto_id: cat_luxo.id,
      regime_alimentacao_id: regimes.cafe.id,
      nome: 'Corporativo Petrobras - Suíte Luxo',
      valor_diaria: '340.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.petrobras.id,
      categoria_quarto_id: cat_master.id,
      regime_alimentacao_id: regimes.cafe.id,
      nome: 'Corporativo Petrobras - Suíte Master Executiva',
      valor_diaria: '680.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  // B) CVC Viagens (Lazer com meia pensão em Luxo e Super Luxo)
  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.cvc.id,
      categoria_quarto_id: cat_luxo.id,
      regime_alimentacao_id: regimes.meia_pensao.id,
      nome: 'Acordo CVC - Luxo Meia Pensão',
      valor_diaria: '490.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.cvc.id,
      categoria_quarto_id: cat_super_luxo.id,
      regime_alimentacao_id: regimes.meia_pensao.id,
      nome: 'Acordo CVC - Super Luxo Meia Pensão',
      valor_diaria: '680.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  // C) Vale S.A. (Corporativo em Super Luxo)
  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.vale.id,
      categoria_quarto_id: cat_super_luxo.id,
      regime_alimentacao_id: regimes.cafe.id,
      nome: 'Corporativo Vale - Super Luxo',
      valor_diaria: '460.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  // D) Decolar (OTA Promocional em Luxo)
  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.decolar.id,
      categoria_quarto_id: cat_luxo.id,
      regime_alimentacao_id: regimes.cafe.id,
      nome: 'Canal Decolar - Luxo Promocional',
      valor_diaria: '420.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  // E) Booking.com (OTA Tarifa Conectada)
  await client.tarifario.create({
    data: {
      hotel_id,
      parceiro_id: parceiros.booking.id,
      categoria_quarto_id: cat_luxo.id,
      regime_alimentacao_id: regimes.cafe.id,
      nome: 'Canal Booking - Luxo Padrão',
      valor_diaria: '440.00',
      ativo: true,
      datas: {
        createMany: {
          data: [...weekday_dates, ...weekend_dates].map(data => ({ data })),
        },
      },
    },
  })

  const total = await client.tarifario.count({ where: { hotel_id } })
  console.log(
    `[DEV] Total de tarifários semeados: ${total} (públicos e vinculados a parceiros).`
  )
}
