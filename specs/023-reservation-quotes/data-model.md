# Data Model: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

## 1. Contratos Compartilhados (`packages/.contracts`)

### 1.1. Contrato de Leads (`packages/.contracts/src/leads.ts`)

```typescript
export interface Lead {
  id: string
  hotel_id: string
  nome: string
  telefone: string
  email: string
  criado_em: string
  atualizado_em: string
}

export interface CreateLeadPayload {
  nome: string
  telefone: string
  email: string
}

export interface UpdateLeadPayload {
  nome?: string
  telefone?: string
  email?: string
}

export interface LeadListParams {
  pagina?: number
  limite?: number
  busca?: string
}

export interface LeadListResponse {
  data: Lead[]
  meta: {
    total: number
    pagina: number
    limite: number
    total_paginas: number
  }
}
```

### 1.2. Contrato de Orçamentos (`packages/.contracts/src/orcamentos.ts`)

```typescript
export interface NoiteCalculadaOrcamento {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export type OrcamentoStatus = 'pendente' | 'aprovado' | 'cancelado' | 'expirado'

export interface Orcamento {
  id: string
  hotel_id: string
  lead_id: string
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas: number
  quantidade_pets: number
  valor_total: string
  detalhamento_noites: NoiteCalculadaOrcamento[]
  token_publico: string
  status: OrcamentoStatus
  observacoes?: string | null
  lead?: {
    id: string
    nome: string
    telefone: string
    email: string
  }
  regime_alimentacao?: {
    id: string
    titulo: string
    cor_pulseira: string
  }
  categoria_quarto?: {
    id: string
    nome: string
  }
  criado_em: string
  atualizado_em: string
}

export interface OrcamentoPublicoVisualizacao {
  token_publico: string
  hotel_nome: string
  hotel_telefone?: string
  check_in: string
  check_out: string
  total_noites: number
  quantidade_adultos: number
  quantidade_criancas: number
  quantidade_pets: number
  regime_alimentacao: {
    nome: string
    cor: string
    descricao?: string | null
  }
  categoria_quarto: {
    nome: string
  }
  lead_nome: string
  detalhamento_noites: NoiteCalculadaOrcamento[]
  valor_total: string
  status: OrcamentoStatus
  criado_em: string
}

export interface CreateOrcamentoPayload {
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string
  // Lead associado: pode ser existente (lead_id) ou criado no ato
  lead_id?: string
  lead?: CreateLeadPayload
}

export interface UpdateOrcamentoPayload {
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  check_in?: string
  check_out?: string
  quantidade_adultos?: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string
  status?: OrcamentoStatus
}

export interface OrcamentoListParams {
  pagina?: number
  limite?: number
  busca?: string
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  status?: OrcamentoStatus
  data_inicio?: string
  data_fim?: string
}

export interface OrcamentoListResponse {
  data: Orcamento[]
  meta: {
    total: number
    pagina: number
    limite: number
    total_paginas: number
  }
}
```

---

## 2. Modelo Relacional no Prisma (`packages/api/src/prisma/schema.prisma`)

```prisma
model Lead {
  id         String      @id @default(uuid())
  hotel_id   String
  nome       String      @db.VarChar(150)
  telefone   String      @db.VarChar(30)
  email      String      @db.VarChar(150)
  created_at DateTime    @default(now())
  updated_at DateTime    @updatedAt
  hotel      Hotel       @relation(fields: [hotel_id], references: [id], onDelete: Cascade)
  orcamentos Orcamento[]

  @@index([hotel_id])
  @@index([hotel_id, email])
  @@index([hotel_id, telefone])
  @@map("leads")
}

model Orcamento {
  id                    String            @id @default(uuid())
  hotel_id              String
  lead_id               String
  regime_alimentacao_id String
  categoria_quarto_id   String
  check_in              String            @db.VarChar(10)
  check_out             String            @db.VarChar(10)
  quantidade_adultos    Int               @default(1)
  quantidade_criancas   Int               @default(0)
  quantidade_pets       Int               @default(0)
  valor_total           String            @db.VarChar(20)
  detalhamento_noites   Json
  token_publico         String            @unique @db.VarChar(64)
  status                String            @default("pendente") @db.VarChar(20)
  observacoes           String?           @db.Text
  created_at            DateTime          @default(now())
  updated_at            DateTime          @updatedAt

  hotel                 Hotel             @relation(fields: [hotel_id], references: [id], onDelete: Cascade)
  lead                  Lead              @relation(fields: [lead_id], references: [id], onDelete: Restrict)
  regime_alimentacao    RegimeAlimentacao @relation(fields: [regime_alimentacao_id], references: [id], onDelete: Restrict)
  categoria_quarto      CategoriaQuarto   @relation(fields: [categoria_quarto_id], references: [id], onDelete: Restrict)

  @@index([hotel_id])
  @@index([hotel_id, status])
  @@index([lead_id])
  @@index([token_publico])
  @@map("orcamentos")
}
```

---

## 3. Invariantes de Negócio e Validações

1. **Vínculo Obrigatório com Lead**: Todo orçamento deve pertencer a um `lead_id` válido no mesmo hotel.
2. **Seleção de Regime e Tarifário Vigente**: O orçamento deve possuir um `regime_alimentacao_id` ativo. A definição do período seguida da seleção do regime permite ao sistema carregar as suítes/categorias que possuem tarifários ativos configurados para o intervalo.
3. **Validade das Datas**: A data de `check_out` deve ser estritamente maior que `check_in` (mínimo de 1 pernoite).
4. **Composição de Hóspedes**: `quantidade_adultos` deve ser maior ou igual a 1. `quantidade_criancas` e `quantidade_pets` não podem ser negativas.
5. **Independência de Inventário de Quartos**: O cálculo do orçamento e a gravação do registro NÃO verificam disponibilidade física nem alocam quartos (`quarto_id` inexistente no modelo de orçamento).
6. **Token Público Seguro**: O `token_publico` deve ser gerado aleatoriamente com no mínimo 32 caracteres criptograficamente seguros no momento da criação e ser único em todo o sistema.
