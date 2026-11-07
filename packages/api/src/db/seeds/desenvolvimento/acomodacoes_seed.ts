import { type DB, db } from '@/lib/prisma'

export interface SeedAcomodacoesResult {
  categorias: Array<{ id: string; nome: string }>
}

export async function seedAcomodacoes(
  hotel_id: string,
  client: DB = db
): Promise<SeedAcomodacoesResult> {
  console.log('[DEV] Semeando categorias e quartos...')

  const categorias = await Promise.all([
    client.categoriaQuarto.create({
      data: { hotel_id, nome: 'Suítes Luxo', status: 'S' },
    }),
    client.categoriaQuarto.create({
      data: { hotel_id, nome: 'Suítes Super Luxo', status: 'S' },
    }),
    client.categoriaQuarto.create({
      data: { hotel_id, nome: 'Suítes Master', status: 'S' },
    }),
    client.categoriaQuarto.create({
      data: { hotel_id, nome: 'Suíte Presidencial', status: 'S' },
    }),
  ])

  const configurations = [
    {
      category: categorias[0],
      numbers: Array.from({ length: 16 }, (_, index) => 101 + index),
      beds: [{ tipo: 'casal', quantidade: 1 }],
      capacity: 2,
    },
    {
      category: categorias[1],
      numbers: Array.from({ length: 16 }, (_, index) => 201 + index),
      beds: [
        { tipo: 'queen', quantidade: 1 },
        { tipo: 'solteiro', quantidade: 1 },
      ],
      capacity: 3,
    },
    {
      category: categorias[2],
      numbers: Array.from({ length: 5 }, (_, index) => 302 + index),
      beds: [
        { tipo: 'king', quantidade: 1 },
        { tipo: 'solteiro', quantidade: 1 },
      ],
      capacity: 3,
    },
    {
      category: categorias[3],
      numbers: [301],
      beds: [
        { tipo: 'king', quantidade: 1 },
        { tipo: 'solteiro', quantidade: 2 },
      ],
      capacity: 4,
    },
  ]

  for (const configuration of configurations) {
    for (const number of configuration.numbers) {
      await client.quarto.create({
        data: {
          hotel_id,
          categoria_id: configuration.category.id,
          identificacao: String(number),
          descricao: `Quarto ${number} - ${configuration.category.nome}`,
          limite_hospedes: configuration.capacity,
          status: 'S',
          camas: { create: configuration.beds },
        },
      })
    }
  }

  return { categorias }
}
