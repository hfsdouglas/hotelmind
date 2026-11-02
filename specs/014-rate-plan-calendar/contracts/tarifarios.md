# Contratos HTTP e Shared Types — Tarifários

## Contratos Compartilhados (`packages/.contracts/src/tarifarios.ts`)

```ts
import type { PaginacaoMeta } from './grupos.js'
import type { CategoriaQuartoResumo } from './quartos.js'

export interface Tarifario {
  id: string
  hotel_id: string
  categoria_quarto_id: string
  nome: string
  data_inicio: string // YYYY-MM-DD (inclusivo)
  data_fim: string // YYYY-MM-DD (exclusivo, intervalo semiaberto [data_inicio, data_fim))
  valor_diaria: string // "200.00"
  ativo: boolean
  categoria_quarto: CategoriaQuartoResumo
  criado_em: string
  atualizado_em: string
}

export interface TarifarioListResponse {
  data: Tarifario[]
  meta: PaginacaoMeta
}

export interface TarifarioListParams {
  pagina?: number
  limite?: number
  busca?: string
  categoria_quarto_id?: string
  ativo?: boolean
}

export interface CreateTarifarioPayload {
  categoria_quarto_id: string
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  ativo?: boolean
}

export interface UpdateTarifarioPayload {
  categoria_quarto_id?: string
  nome?: string
  data_inicio?: string
  data_fim?: string
  valor_diaria?: string
  ativo?: boolean
}

export interface PeriodoTarifarioCalendario {
  id: string
  categoria_quarto_id: string
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  ativo: boolean
}

export interface ConsultarCalendarioTarifariosParams {
  categoria_quarto_id: string
  data_inicio?: string
  data_fim?: string
}

export interface ConsultarCalendarioTarifariosResponse {
  data: PeriodoTarifarioCalendario[]
}

export interface NoiteCalculadaReserva {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export interface CalculoTarifaReserva {
  noites: NoiteCalculadaReserva[]
  valor_total: string
}
```

---

## Endpoints da API (`packages/api/src/routes/tarifarios/tarifarios_routes.ts`)

Todos os endpoints exigem autenticação (`onRequest: [app.authenticate]`) e obtêm `hotel_id` exclusivamente de `request.user.hotelId`.

### 1. `GET /tarifarios`

Lista os tarifários do hotel autenticado com paginação e filtros.

- **Query Parameters**:
  - `pagina` (opcional, inteiro >= 1, padrão `1`)
  - `limite` (opcional, `25 | 50 | 100 | 250`, padrão `25`)
  - `busca` (opcional, texto parcial case-insensitive em `nome` ou `categoria_quarto.nome`)
  - `categoria_quarto_id` (opcional, UUID ou lista separada por vírgula)
  - `ativo` (opcional, `"true"` | `"false"` booleano)
- **Respostas**:
  - `200 OK`: `TarifarioListResponse`
  - `401 Unauthorized`: `{ "message": string }`

### 2. `GET /tarifarios/calendario`

Consulta os períodos tarifários existentes para exibição no calendário mensal.

- **Query Parameters**:
  - `categoria_quarto_id` (obrigatório, UUID da categoria pertencente ao hotel ativo)
  - `data_inicio` (opcional, `YYYY-MM-DD`, início da janela de consulta)
  - `data_fim` (opcional, `YYYY-MM-DD`, fim exclusivo da janela de consulta)
- **Respostas**:
  - `200 OK`: `ConsultarCalendarioTarifariosResponse`
  - `400 Bad Request`: parâmetros inválidos
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: categoria não encontrada no hotel ativo

### 3. `GET /tarifarios/:id`

Consulta os detalhes de um tarifário específico do hotel autenticado.

- **Respostas**:
  - `200 OK`: `Tarifario`
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: tarifário não encontrado ou pertencente a outro hotel

### 4. `POST /tarifarios`

Cria um novo tarifário no hotel autenticado.

- **Request Body**:
  ```json
  {
    "categoria_quarto_id": "uuid",
    "nome": "Baixa temporada",
    "data_inicio": "2027-03-01",
    "data_fim": "2027-04-01",
    "valor_diaria": "200.00",
    "ativo": true
  }
  ```
- **Regras de Validação**:
  - `nome`: `trim()`, não vazio, máx. 100 caracteres.
  - `categoria_quarto_id`: deve pertencer ao hotel ativo e estar ativa (`status === 'S'`).
  - `data_inicio` e `data_fim`: datas válidas `YYYY-MM-DD` com `data_inicio < data_fim`.
  - `valor_diaria`: numérico `>= 0` com até 2 casas decimais, normalizado para `"0.00"`.
  - `ativo`: booleano (padrão `true`).
  - Sem sobreposição de período `[data_inicio, data_fim)` com outro tarifário ativo no mesmo `(hotel_id, categoria_quarto_id)`.
- **Respostas**:
  - `201 Created`: `Tarifario`
  - `400 Bad Request`: erro de validação de campos ou datas
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: categoria não encontrada ou inativa no hotel ativo
  - `409 Conflict`: `{ "message": "Já existe um tarifário ativo com período sobreposto para esta categoria." }`

### 5. `PATCH /tarifarios/:id`

Edita os dados de um tarifário existente do hotel autenticado, desconsiderando o próprio `id` na verificação de conflitos de período.

- **Request Body**: `UpdateTarifarioPayload`
- **Respostas**:
  - `200 OK`: `Tarifario`
  - `400 Bad Request`: erro de validação
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: tarifário ou categoria não encontrados no hotel ativo
  - `409 Conflict`: conflito de período com outro tarifário ativo da mesma categoria

### 6. `PATCH /tarifarios/:id/ativar`

Reativa um tarifário (`ativo = true`), validando novamente a inexistência de conflitos de período com outros tarifários ativos no mesmo `(hotel_id, categoria_quarto_id)`.

- **Respostas**:
  - `200 OK`: `Tarifario`
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: tarifário não encontrado no hotel ativo
  - `409 Conflict`: conflito de período com outro tarifário ativo existente

### 7. `PATCH /tarifarios/:id/desativar`

Desativa um tarifário (`ativo = false`) preservando seu histórico.

- **Respostas**:
  - `200 OK`: `Tarifario`
  - `401 Unauthorized`: não autenticado
  - `404 Not Found`: tarifário não encontrado no hotel ativo
