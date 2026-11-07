import bcrypt from 'bcryptjs'
import { type DB, db } from '@/lib/prisma'

export interface SeedHotelResult {
  hotel: { id: string; nome_fantasia: string }
  grupo: { id: string; grupo: string }
  user: { id: string; email: string }
  admin: { id: string; email: string }
}

export async function seedHotel(client: DB = db): Promise<SeedHotelResult> {
  console.log('[DEV] Semeando hotel padrão e credenciais de acesso...')

  const hotel = await client.hotel.create({
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

  const grupo = await client.grupo.create({
    data: {
      hotel_id: hotel.id,
      grupo: 'Administrador',
      descricao: 'Acesso total ao sistema',
      status: 'S',
    },
  })

  const senha = await bcrypt.hash('senha123', 10)

  const user = await client.user.create({
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

  const admin = await client.administrator.create({
    data: {
      nome_completo: 'Super Admin',
      email: 'admin@hotelmind.com.br',
      senha: adminSenha,
      status: 'S',
    },
  })

  return { hotel, grupo, user, admin }
}
