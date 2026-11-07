import { type DB, db } from '@/lib/prisma'

export interface SeedRegimesResult {
  cafe: { id: string; titulo: string }
  meia_pensao: { id: string; titulo: string }
  pensao_completa: { id: string; titulo: string }
  all_inclusive: { id: string; titulo: string }
}

export async function seedRegimes(
  hotel_id: string,
  client: DB = db
): Promise<SeedRegimesResult> {
  console.log('[DEV] Semeando regimes de alimentação...')

  const [cafe, meia_pensao, pensao_completa, all_inclusive] = await Promise.all(
    [
      client.regimeAlimentacao.create({
        data: {
          hotel_id,
          titulo: 'Café da Manhã',
          descricao: 'Buffet completo servido das 06:30 às 10:00.',
          cor_pulseira: '#3B82F6',
          ativo: true,
        },
      }),
      client.regimeAlimentacao.create({
        data: {
          hotel_id,
          titulo: 'Meia Pensão',
          descricao: 'Café da manhã e jantar com bebidas não alcoólicas.',
          cor_pulseira: '#10B981',
          ativo: true,
        },
      }),
      client.regimeAlimentacao.create({
        data: {
          hotel_id,
          titulo: 'Pensão Completa',
          descricao:
            'Café da manhã, almoço e jantar inclusos no restaurante principal.',
          cor_pulseira: '#F59E0B',
          ativo: true,
        },
      }),
      client.regimeAlimentacao.create({
        data: {
          hotel_id,
          titulo: 'All Inclusive',
          descricao: 'Todas as refeições, petiscos e bebidas liberadas 24h.',
          cor_pulseira: '#8B5CF6',
          ativo: true,
        },
      }),
    ]
  )

  return { cafe, meia_pensao, pensao_completa, all_inclusive }
}
