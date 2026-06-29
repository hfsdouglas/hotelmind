# API Contracts: Gestão de Permissões por Grupos

**Feature**: 006-permissoes-grupos
**Base URL**: `/` (same as existing API)
**Auth**: Cookie `token` (httpOnly JWT) via `app.authenticate` hook

---

## Contratos Compartilhados (`packages/.contracts/src/`)

### Novo: `rotas.ts`

```ts
export interface RotaMenu {
  modulo: string
  recurso: string
  rota: string
  icone?: string | null
  ordem: number
}
```

### Atualizado: `auth.ts`

```ts
export interface AuthUser {
  id: string
  nome_completo: string
  email: string
  hotel_id: string
  grupos_ids?: string | null  // novo campo
}

export interface LoginResponse {
  user: AuthUser
  hotel: AuthHotel
  message: string
  rotas: RotaMenu[]  // novo campo
}
```

### Novo: `grupos.ts`

```ts
export interface Grupo {
  id: string
  hotel_id: string
  grupo: string
  descricao: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface PaginacaoMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginacaoMeta
}
```

### Novo: `usuarios.ts`

```ts
export interface Usuario {
  id: string
  hotel_id: string
  nome_completo: string
  email: string
  nascimento: string
  genero: string
  celular: string
  cpf: string
  rg: string | null
  grupos_ids: string | null
  created_at: string
  updated_at: string
}
```

---

## Endpoints

### POST /auth/login (atualizado)

**Request** (sem alteração):
```json
{ "email": "string", "senha": "string" }
```

**Response 200** (com campo `rotas` adicionado):
```json
{
  "user": {
    "id": "uuid",
    "nome_completo": "Administrador HotelMind",
    "email": "admin@hotelmind.com.br",
    "hotel_id": "uuid",
    "grupos_ids": "uuid-grupo-1"
  },
  "hotel": {
    "id": "uuid",
    "nome_hotel": "HotelMind",
    "nome_fantasia": "HotelMind",
    "cnpj": "00000000000000"
  },
  "message": "Seja bem-vindo, Administrador!",
  "rotas": [
    { "modulo": "Dashboard", "recurso": "Dashboard", "rota": "/", "icone": "LayoutDashboard", "ordem": 0 },
    { "modulo": "Reservas", "recurso": "Listar reservas", "rota": "/reservas", "icone": "CalendarDays", "ordem": 10 }
  ]
}
```

---

### GET /grupos

**Auth**: Sim
**Query params**:
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| pagina | number | 1 | Página atual |
| limite | number | 50 | Resultados por página (max 250) |
| busca | string | — | Texto livre (nome do grupo) |
| ordenar_por | string | "grupo" | Campo de ordenação |
| direcao | "asc"\|"desc" | "asc" | Direção da ordenação |
| status | "S"\|"N" | — | Filtro por status |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "hotel_id": "uuid",
      "grupo": "Administrador",
      "descricao": "Acesso total ao sistema",
      "status": "S",
      "created_at": "2026-06-29T00:00:00.000Z",
      "updated_at": "2026-06-29T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagina": 1,
    "limite": 50,
    "total": 1,
    "ultima_pagina": 1
  }
}
```

---

### POST /grupos

**Auth**: Sim
**Request body**:
```json
{
  "grupo": "Recepcionista",
  "descricao": "Acesso à recepção",
  "status": "S",
  "rota_ids": ["uuid-rota-1", "uuid-rota-2"]
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "hotel_id": "uuid",
  "grupo": "Recepcionista",
  "descricao": "Acesso à recepção",
  "status": "S",
  "created_at": "2026-06-29T00:00:00.000Z",
  "updated_at": "2026-06-29T00:00:00.000Z"
}
```

**Response 409** (nome duplicado):
```json
{ "message": "Já existe um grupo com este nome neste hotel." }
```

---

### GET /grupos/:id

**Auth**: Sim
**Response 200**:
```json
{
  "id": "uuid",
  "hotel_id": "uuid",
  "grupo": "Administrador",
  "descricao": null,
  "status": "S",
  "created_at": "...",
  "updated_at": "...",
  "rotas": [
    { "id": "uuid", "modulo": "Dashboard", "recurso": "Dashboard", "rota": "/", "icone": "LayoutDashboard", "ordem": 0 }
  ]
}
```

**Response 404**:
```json
{ "message": "Grupo não encontrado." }
```

---

### PUT /grupos/:id

**Auth**: Sim
**Request body** (todos opcionais):
```json
{
  "grupo": "Nome atualizado",
  "descricao": "Nova descrição",
  "status": "N",
  "rota_ids": ["uuid-rota-1"]
}
```

**Response 200**: Mesmo shape do GET /grupos/:id
**Response 404**: `{ "message": "Grupo não encontrado." }`
**Response 409**: `{ "message": "Já existe um grupo com este nome neste hotel." }`

---

### DELETE /grupos/:id

**Auth**: Sim
**Response 204**: (sem body)
**Response 404**: `{ "message": "Grupo não encontrado." }`
**Response 409**: `{ "message": "Este grupo possui usuários vinculados e não pode ser excluído." }`

---

### GET /usuarios

**Auth**: Sim
**Query params**:
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| pagina | number | 1 | Página atual |
| limite | number | 50 | Resultados por página (max 250) |
| busca | string | — | Texto livre (nome, email, cpf) |
| ordenar_por | string | "nome_completo" | Campo de ordenação |
| direcao | "asc"\|"desc" | "asc" | Direção da ordenação |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "hotel_id": "uuid",
      "nome_completo": "Administrador HotelMind",
      "email": "admin@hotelmind.com.br",
      "nascimento": "1990-01-01",
      "genero": "Masculino",
      "celular": "11999999999",
      "cpf": "00000000000",
      "rg": null,
      "grupos_ids": "uuid-grupo",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": { "pagina": 1, "limite": 50, "total": 1, "ultima_pagina": 1 }
}
```

---

### POST /usuarios

**Auth**: Sim
**Request body**:
```json
{
  "nome_completo": "João Silva",
  "email": "joao@hotel.com",
  "senha": "senha123",
  "nascimento": "1990-01-01",
  "genero": "Masculino",
  "celular": "11999999999",
  "cpf": "12345678901",
  "rg": null,
  "grupos_ids": "uuid-grupo-1,uuid-grupo-2"
}
```

**Response 201**: Shape completo do usuário (sem `senha`)
**Response 409**: `{ "message": "Email, CPF ou celular já cadastrado." }`

---

### GET /usuarios/:id

**Auth**: Sim
**Response 200**: Shape completo do usuário (sem `senha`)
**Response 404**: `{ "message": "Usuário não encontrado." }`

---

### PUT /usuarios/:id

**Auth**: Sim
**Request body** (todos opcionais exceto os de unicidade que não mudam):
```json
{
  "nome_completo": "João Silva Atualizado",
  "grupos_ids": "uuid-grupo-1",
  "status": "S"
}
```

**Response 200**: Shape completo do usuário
**Response 404**: `{ "message": "Usuário não encontrado." }`

---

### GET /rotas

**Auth**: Sim
**Descrição**: Retorna rotas ativas do hotel da sessão (via rotas_hoteis), para uso na configuração de grupos.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "modulo": "Dashboard",
    "recurso": "Dashboard",
    "rota": "/",
    "icone": "LayoutDashboard",
    "ordem": 0,
    "ativo": true
  },
  {
    "id": "uuid",
    "modulo": "Reservas",
    "recurso": "Listar reservas",
    "rota": "/reservas",
    "icone": "CalendarDays",
    "ordem": 10,
    "ativo": true
  }
]
```

---

## Query Params — Padrão de Paginação

Todos os endpoints de listagem seguem este padrão de query params:

```
GET /grupos?pagina=2&limite=100&busca=admin&ordenar_por=grupo&direcao=desc&status=S
```

E retornam sempre o objeto `meta`:

```json
{
  "data": [...],
  "meta": {
    "pagina": 2,
    "limite": 100,
    "total": 250,
    "ultima_pagina": 3
  }
}
```
