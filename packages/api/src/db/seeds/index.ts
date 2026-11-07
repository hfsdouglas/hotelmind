import 'dotenv/config'
import { db } from '@/lib/prisma'
import { seedAcomodacoes } from './desenvolvimento/acomodacoes_seed'
import { seedHotel } from './desenvolvimento/hotel_seed'
import { seedParceiros } from './desenvolvimento/parceiros_seed'
import { seedRegimes } from './desenvolvimento/regimes_seed'
import { seedTarifarios } from './desenvolvimento/tarifarios_seed'
import { seedRoutes } from './producao/rotas_seed'

async function clean() {
  console.log('Limpando dados do banco de dados...')
  await db.reservaLog.deleteMany()
  await db.hospedeEndereco.deleteMany()
  await db.hospede.deleteMany()
  await db.reserva.deleteMany()
  await db.orcamento.deleteMany()
  await db.lead.deleteMany()
  await db.tarifarioData.deleteMany()
  await db.tarifario.deleteMany()
  await db.parceiroContato.deleteMany()
  await db.parceiroEndereco.deleteMany()
  await db.parceiro.deleteMany()
  await db.configuracaoCama.deleteMany()
  await db.quarto.deleteMany()
  await db.categoriaQuarto.deleteMany()
  await db.regimeAlimentacao.deleteMany()
  await db.grupoRota.deleteMany()
  await db.rotaHotel.deleteMany()
  await db.grupo.deleteMany()
  await db.user.deleteMany()
  await db.hotelEndereco.deleteMany()
  await db.rota.deleteMany()
  await db.hotel.deleteMany()
  await db.administrator.deleteMany()
  console.log('Banco de dados limpo com sucesso.')
}

async function seed() {
  console.log('=== INICIANDO SEED COMPLETO DE DESENVOLVIMENTO ===')
  await clean()

  // 1. Hotel, Grupos e Usuários
  const { hotel, grupo, user, admin } = await seedHotel(db)

  // 2. Rotas do Sistema (Módulo de Produção)
  const createdRoutes = await seedRoutes(db)

  // 3. Regimes de Alimentação
  const regimes = await seedRegimes(hotel.id, db)

  // 4. Acomodações (Categorias e Quartos)
  const acomodacoes = await seedAcomodacoes(hotel.id, db)

  // 5. Parceiros Comerciais (5 parceiros completos com perfis distintos)
  const parceiros = await seedParceiros(hotel.id, db)

  // 6. Tarifários (Públicos e Vinculados a Parceiros)
  await seedTarifarios(hotel.id, acomodacoes, regimes, parceiros, db)

  console.log('=== SEED FINALIZADO COM SUCESSO ===')
  console.log(`Hotel: ${hotel.nome_fantasia} (${hotel.id})`)
  console.log(`Rotas cadastradas: ${createdRoutes.length}`)
  console.log(`Grupo: ${grupo.grupo} (${grupo.id})`)
  console.log(`Usuário: ${user.email}`)
  console.log(`Admin: ${admin.email}`)
  console.log('Credenciais hotel: douglas@furnaspark.com.br / senha123')
  console.log('Credenciais admin: admin@hotelmind.com.br / admin123')
}

seed()
  .catch(e => {
    console.error('Erro durante a execução do seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
