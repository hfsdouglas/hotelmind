import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/prisma'
import { BASE_ROUTES, seedRoutes } from './routes_seed'

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

async function clean() {
  await db.tarifarioData.deleteMany()
  await db.tarifario.deleteMany()
  await db.configuracaoCama.deleteMany()
  await db.quarto.deleteMany()
  await db.categoriaQuarto.deleteMany()
  await db.grupoRota.deleteMany()
  await db.rotaHotel.deleteMany()
  await db.grupo.deleteMany()
  await db.user.deleteMany()
  await db.hotelEndereco.deleteMany()
  await db.rota.deleteMany()
  await db.hotel.deleteMany()
  await db.administrator.deleteMany()
  console.log('Database cleaned.')
}

async function seed() {
  await clean()

  const hotel = await db.hotel.create({
    data: {
      nome_hotel: 'Furnaspark Resort',
      razao_social: 'Furnaspark Resort Ltda',
      nome_fantasia: 'Furnaspark Resort',
      cnpj: '00000000000000',
      email_comercial: 'contato@furnaspark.com.br',
      telefone_comercial: '11999999999',
      enderecos: {
        create: {
          rua: 'Rua das Flores',
          numero: '100',
          bairro: 'Centro',
          cep: '01310100',
          cidade: 'São Paulo',
          estado: 'SP',
        },
      },
    },
  })

  const grupo = await db.grupo.create({
    data: {
      hotel_id: hotel.id,
      grupo: 'Administrador',
      descricao: 'Acesso total ao sistema',
      status: 'S',
    },
  })

  const createdRoutes = await seedRoutes(db)

  const categorias = await Promise.all([
    db.categoriaQuarto.create({ data: { hotel_id: hotel.id, nome: 'Suítes Luxo', status: 'S' } }),
    db.categoriaQuarto.create({ data: { hotel_id: hotel.id, nome: 'Suítes Super Luxo', status: 'S' } }),
    db.categoriaQuarto.create({ data: { hotel_id: hotel.id, nome: 'Suítes Master', status: 'S' } }),
    db.categoriaQuarto.create({ data: { hotel_id: hotel.id, nome: 'Suíte Presidencial', status: 'S' } }),
  ])

  const configurations = [
    { category: categorias[0], numbers: Array.from({ length: 16 }, (_, index) => 101 + index), beds: [{ tipo: 'casal', quantidade: 1 }], capacity: 2 },
    { category: categorias[1], numbers: Array.from({ length: 16 }, (_, index) => 201 + index), beds: [{ tipo: 'queen', quantidade: 1 }, { tipo: 'solteiro', quantidade: 1 }], capacity: 3 },
    { category: categorias[2], numbers: Array.from({ length: 5 }, (_, index) => 302 + index), beds: [{ tipo: 'king', quantidade: 1 }, { tipo: 'solteiro', quantidade: 1 }], capacity: 3 },
    { category: categorias[3], numbers: [301], beds: [{ tipo: 'king', quantidade: 1 }, { tipo: 'solteiro', quantidade: 2 }], capacity: 4 },
  ]
  for (const configuration of configurations) {
    for (const number of configuration.numbers) {
      await db.quarto.create({ data: { hotel_id: hotel.id, categoria_id: configuration.category.id, identificacao: String(number), descricao: `Quarto ${number} - ${configuration.category.nome}`, limite_hospedes: configuration.capacity, status: 'S', camas: { create: configuration.beds } } })
    }
  }
  const seeded_room_counts = await Promise.all(categorias.map(category => db.quarto.count({ where: { categoria_id: category.id, hotel_id: hotel.id } })))
  console.log(`Quartos por categoria: ${categorias.map((category, index) => `${category.nome}=${seeded_room_counts[index]}`).join(', ')}`)

  const current_year = new Date().getUTCFullYear()
  const { weekday_dates, weekend_dates } =
    build_year_dates_by_schedule(current_year)

  const rate_plans_by_category = [
    {
      category: categorias[0],
      weekday_rate: '450.00',
      weekend_rate: '650.00',
    },
    {
      category: categorias[1],
      weekday_rate: '600.00',
      weekend_rate: '850.00',
    },
    {
      category: categorias[2],
      weekday_rate: '850.00',
      weekend_rate: '1200.00',
    },
    {
      category: categorias[3],
      weekday_rate: '1500.00',
      weekend_rate: '2100.00',
    },
  ]

  for (const plan of rate_plans_by_category) {
    await db.tarifario.create({
      data: {
        hotel_id: hotel.id,
        categoria_quarto_id: plan.category.id,
        nome: 'Baixa temporada (dias de semana)',
        valor_diaria: plan.weekday_rate,
        ativo: true,
        datas: {
          createMany: {
            data: weekday_dates.map(data => ({ data })),
          },
        },
      },
    })

    await db.tarifario.create({
      data: {
        hotel_id: hotel.id,
        categoria_quarto_id: plan.category.id,
        nome: 'Baixa temporada (fins de semana)',
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

  const seeded_tarifarios_count = await db.tarifario.count({
    where: { hotel_id: hotel.id },
  })
  console.log(
    `Tarifários criados (${current_year}): ${seeded_tarifarios_count} (${weekday_dates.length} dias de semana / ${weekend_dates.length} dias de fim de semana por categoria)`,
  )

  const senha = await bcrypt.hash('senha123', 10)

  const user = await db.user.create({
    data: {
      hotel_id: hotel.id,
      nome_completo: 'Douglas Faria',
      email: 'douglas@furnaspark.com.br',
      senha,
      nascimento: new Date('1990-01-01'),
      genero: 'Masculino',
      celular: '11999999999',
      cpf: '00000000000',
      grupos_ids: grupo.id,
    },
  })

  const adminSenha = await bcrypt.hash('admin123', 10)

  const admin = await db.administrator.create({
    data: {
      nome_completo: 'Super Admin',
      email: 'admin@hotelmind.com.br',
      senha: adminSenha,
      status: 'S',
    },
  })

  console.log(`Hotel: ${hotel.nome_fantasia} (${hotel.id})`)
  console.log(`Rotas: ${createdRoutes.length}`)
  console.log(`Grupo: ${grupo.grupo} (${grupo.id})`)
  console.log(`Usuário: ${user.email} | grupos_ids: ${user.grupos_ids}`)
  console.log(`Admin: ${admin.email}`)
  console.log('Credenciais hotel: douglas@furnaspark.com.br / senha123')
  console.log('Credenciais admin: admin@hotelmind.com.br / admin123')
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
