import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/prisma'

const BASE_ROUTES = [
  { modulo: 'Dashboard', recurso: 'Dashboard', rota: '/', icone: 'LayoutDashboard', ordem: 0 },
  { modulo: 'Reservas', recurso: 'Listar reservas', rota: '/reservas', icone: 'CalendarDays', ordem: 10 },
  { modulo: 'Reservas', recurso: 'Nova reserva', rota: '/reservas/nova', icone: 'CalendarDays', ordem: 11 },
  { modulo: 'Quartos', recurso: 'Categorias', rota: '/categorias_quartos', icone: 'BedDouble', ordem: 20 },
  { modulo: 'Quartos', recurso: 'Quartos', rota: '/quartos', icone: 'BedDouble', ordem: 21 },
  { modulo: 'Tarifários', recurso: 'Tarifários', rota: '/tarifarios', icone: 'CalendarRange', ordem: 25 },
  { modulo: 'Usuários', recurso: 'Listar usuários', rota: '/usuarios', icone: 'Users', ordem: 30 },
  { modulo: 'Usuários', recurso: 'Novo usuário', rota: '/usuarios/novo', icone: 'Users', ordem: 31 },
  { modulo: 'Grupos', recurso: 'Listar grupos', rota: '/grupos', icone: 'Shield', ordem: 40 },
  { modulo: 'Grupos', recurso: 'Novo grupo', rota: '/grupos/novo', icone: 'Shield', ordem: 41 },
]

async function clean() {
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

  const createdRoutes = await db.rota.createManyAndReturn({
    data: BASE_ROUTES,
  })

  await db.rotaHotel.createMany({
    data: createdRoutes.map(r => ({ hotel_id: hotel.id, rota_id: r.id })),
  })

  const grupo = await db.grupo.create({
    data: {
      hotel_id: hotel.id,
      grupo: 'Administrador',
      descricao: 'Acesso total ao sistema',
      status: 'S',
    },
  })

  await db.grupoRota.createMany({
    data: createdRoutes.map(r => ({ grupo_id: grupo.id, rota_id: r.id })),
  })

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
