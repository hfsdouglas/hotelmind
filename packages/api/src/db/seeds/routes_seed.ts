export * from './producao/rotas_seed'

import { fileURLToPath } from 'node:url'
import { db } from '@/lib/prisma'
import { seedRoutes } from './producao/rotas_seed'

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
