import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from '@/db/client'

async function seed() {
  const hotel = await db.hotel.upsert({
    where: { cnpj: '00000000000000' },
    update: {},
    create: {
      nome_hotel: 'HotelMind',
      razao_social: 'HotelMind Ltda',
      nome_fantasia: 'HotelMind',
      cnpj: '00000000000000',
      email_comercial: 'contato@hotelmind.com.br',
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

  const senha = await bcrypt.hash('senha123', 10)

  const user = await db.user.upsert({
    where: { email: 'admin@hotelmind.com.br' },
    update: {},
    create: {
      hotel_id: hotel.id,
      nome_completo: 'Administrador HotelMind',
      email: 'admin@hotelmind.com.br',
      senha,
      nascimento: new Date('1990-01-01'),
      genero: 'Masculino',
      celular: '11999999999',
      cpf: '00000000000',
    },
  })

  console.log(`Hotel criado: ${hotel.nome_fantasia} (${hotel.id})`)
  console.log(`Usuário criado: ${user.email}`)
  console.log('Credenciais de acesso:')
  console.log('  Email:  admin@hotelmind.com.br')
  console.log('  Senha:  senha123')
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
