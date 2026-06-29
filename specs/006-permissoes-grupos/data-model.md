# Data Model: Gestão de Permissões por Grupos

**Feature**: 006-permissoes-grupos
**Date**: 2026-06-29

---

## Alterações no Schema Prisma

### Novos modelos

#### Grupo

```prisma
model Grupo {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  hotel_id   String
  hotel      Hotel    @relation(fields: [hotel_id], references: [id], onDelete: Cascade)

  grupo      String   @db.VarChar(100)
  descricao  String?  @db.Text
  status     String   @default("S") @db.Char(1)

  rotas      GrupoRota[]

  @@unique([hotel_id, grupo])
  @@index([hotel_id])
  @@index([grupo])
  @@map("grupos")
}
```

#### Rota

```prisma
model Rota {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  modulo     String   @db.VarChar(100)
  recurso    String   @db.VarChar(100)
  rota       String   @db.VarChar(255)
  icone      String?  @db.VarChar(50)
  ordem      Int      @default(0)
  ativo      Boolean  @default(true)

  hoteis     RotaHotel[]
  grupos     GrupoRota[]

  @@map("rotas")
}
```

#### RotaHotel (pivot)

```prisma
model RotaHotel {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  hotel_id   String
  hotel      Hotel    @relation(fields: [hotel_id], references: [id], onDelete: Cascade)

  rota_id    String
  rota       Rota     @relation(fields: [rota_id], references: [id], onDelete: Cascade)

  @@unique([hotel_id, rota_id])
  @@index([hotel_id])
  @@map("rotas_hoteis")
}
```

#### GrupoRota (pivot)

```prisma
model GrupoRota {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  grupo_id   String
  grupo      Grupo    @relation(fields: [grupo_id], references: [id], onDelete: Cascade)

  rota_id    String
  rota       Rota     @relation(fields: [rota_id], references: [id], onDelete: Cascade)

  @@unique([grupo_id, rota_id])
  @@index([grupo_id])
  @@map("grupos_rotas")
}
```

### Alteração no modelo User

Adicionar campo:

```prisma
grupos_ids String? @db.Text
```

Adicionar relação reversa no Hotel (opcional, para navegação Prisma):

```prisma
grupos     Grupo[]
rotas      RotaHotel[]
```

---

## Entidades de Domínio (`core/entities/`)

### Grupo

```ts
// packages/api/src/core/entities/grupo.ts
export interface GrupoProps {
  id: string
  hotel_id: string
  grupo: string
  descricao: string | null
  status: string
  created_at: Date
  updated_at: Date
}

export class Grupo {
  readonly id: string
  readonly hotel_id: string
  readonly grupo: string
  readonly descricao: string | null
  readonly status: string
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: GrupoProps) { ... }

  get is_ativo(): boolean { return this.status === 'S' }

  static create(props: GrupoProps): Grupo { ... }
}
```

### Rota

```ts
// packages/api/src/core/entities/rota.ts
export interface RotaProps {
  id: string
  modulo: string
  recurso: string
  rota: string
  icone: string | null
  ordem: number
  ativo: boolean
}

export class Rota {
  readonly id: string
  readonly modulo: string
  readonly recurso: string
  readonly rota: string
  readonly icone: string | null
  readonly ordem: number
  readonly ativo: boolean

  constructor(props: RotaProps) { ... }

  static create(props: RotaProps): Rota { ... }
}
```

---

## Interfaces de Repositório (`core/repositories/`)

### IGrupoRepository

```ts
export interface PaginationInput {
  pagina: number        // default 1
  limite: number        // default 50, max 250
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export interface PaginationMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface IGrupoRepository {
  list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<Grupo>>
  create(data: CreateGrupoData): Promise<Grupo>
  findById(id: string, hotelId: string): Promise<Grupo | null>
  update(id: string, hotelId: string, data: UpdateGrupoData): Promise<Grupo>
  delete(id: string, hotelId: string): Promise<void>
  hasLinkedUsers(id: string, hotelId: string): Promise<boolean>
  listRoutes(grupoId: string): Promise<Rota[]>
  syncRoutes(grupoId: string, rotaIds: string[]): Promise<void>
}
```

### IRotaRepository

```ts
export interface IRotaRepository {
  findByHotel(hotelId: string): Promise<Rota[]>
  findByUsuario(hotelId: string, grupoIds: string[]): Promise<Rota[]>
}
```

### IUsuarioRepository (extends IUserRepository)

```ts
export interface IUsuarioRepository extends IUserRepository {
  list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>>
  create(data: CreateUsuarioData): Promise<User>
  findById(id: string, hotelId: string): Promise<User | null>
  update(id: string, hotelId: string, data: UpdateUsuarioData): Promise<User>
}
```

---

## Relacionamentos e Diagrama

```
Hotel ──< RotaHotel >── Rota
  │                      │
  └──< Grupo >── GrupoRota ┘
        │
User ───┘ (via grupos_ids: CSV string)
```

- Um Hotel tem muitas Rotas ativadas via RotaHotel
- Um Hotel tem muitos Grupos
- Um Grupo tem muitas Rotas vinculadas via GrupoRota
- Um Usuário pertence a 0..N Grupos (via campo texto grupos_ids)
- As rotas visíveis ao usuário = Rotas dos seus Grupos ∩ Rotas do Hotel

---

## Seeds (dados iniciais)

### Rotas base do sistema

| modulo      | recurso           | rota               | icone            | ordem |
|-------------|-------------------|--------------------|------------------|-------|
| Dashboard   | Dashboard         | /                  | LayoutDashboard  | 0     |
| Reservas    | Listar reservas   | /reservas          | CalendarDays     | 10    |
| Reservas    | Nova reserva      | /reservas/nova     | CalendarDays     | 11    |
| Quartos     | Listar quartos    | /quartos           | BedDouble        | 20    |
| Quartos     | Novo quarto       | /quartos/novo      | BedDouble        | 21    |
| Usuários    | Listar usuários   | /usuarios          | Users            | 30    |
| Usuários    | Novo usuário      | /usuarios/novo     | Users            | 31    |
| Grupos      | Listar grupos     | /grupos            | Shield           | 40    |
| Grupos      | Novo grupo        | /grupos/novo       | Shield           | 41    |

### Para o hotel de teste (HotelMind)

- Todas as rotas acima são ativadas via `rotas_hoteis`
- Criar grupo "Administrador" com status 'S'
- Vincular todas as rotas ao grupo "Administrador" via `grupos_rotas`
- Atualizar user `admin@hotelmind.com.br` com `grupos_ids = "<id-do-grupo-administrador>"`

---

## Validações de Domínio

| Campo        | Regra                                               |
|--------------|-----------------------------------------------------|
| Grupo.grupo  | Obrigatório, 1–100 chars, único por hotel           |
| Grupo.status | 'S' ou 'N'                                          |
| User.email   | Único global (já existente)                         |
| User.cpf     | Único global (já existente)                         |
| User.celular | Único global (já existente)                         |
| grupos_ids   | Cada ID deve existir na tabela grupos do mesmo hotel|
| limite       | Mínimo 1, máximo 250                                |
| pagina       | Mínimo 1                                            |
