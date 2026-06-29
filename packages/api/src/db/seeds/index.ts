import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from '@/db/client'

const BASE_ROUTES = [
  { modulo: 'Dashboard', recurso: 'Dashboard', rota: '/', icone: 'LayoutDashboard', ordem: 0 },
  { modulo: 'Reservas', recurso: 'Listar reservas', rota: '/reservas', icone: 'CalendarDays', ordem: 10 },
  { modulo: 'Reservas', recurso: 'Nova reserva', rota: '/reservas/nova', icone: 'CalendarDays', ordem: 11 },
  { modulo: 'Quartos', recurso: 'Listar quartos', rota: '/quartos', icone: 'BedDouble', ordem: 20 },
  { modulo: 'Quartos', recurso: 'Novo quarto', rota: '/quartos/novo', icone: 'BedDouble', ordem: 21 },
  { modulo: 'Usuários', recurso: 'Listar usuários', rota: '/usuarios', icone: 'Users', ordem: 30 },
  { modulo: 'Usuários', recurso: 'Novo usuário', rota: '/usuarios/novo', icone: 'Users', ordem: 31 },
  { modulo: 'Grupos', recurso: 'Listar grupos', rota: '/grupos', icone: 'Shield', ordem: 40 },
  { modulo: 'Grupos', recurso: 'Novo grupo', rota: '/grupos/novo', icone: 'Shield', ordem: 41 },
]

async function clean() {
  // Delete in correct dependency order (leaf tables first)
  await db.grupoRota.deleteMany()
  await db.rotaHotel.deleteMany()
  await db.grupo.deleteMany()
  await db.user.deleteMany()
  await db.hotelEndereco.deleteMany()
  await db.rota.deleteMany()
  await db.hotel.deleteMany()
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

  console.log(`Hotel: ${hotel.nome_fantasia} (${hotel.id})`)
  console.log(`Rotas: ${createdRoutes.length}`)
  console.log(`Grupo: ${grupo.grupo} (${grupo.id})`)
  console.log(`Usuário: ${user.email} | grupos_ids: ${user.grupos_ids}`)
  console.log('Credenciais: douglas@furnaspark.com.br / senha123')
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
