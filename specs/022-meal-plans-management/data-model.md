# Data Model: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

## 1. Contratos Compartilhados (`packages/.contracts`)

### 1.1. `RegimeAlimentacao`

```typescript
interface RegimeAlimentacao {
  id: string
  hotel_id: string
  nome: string
  descricao?: string | null
  cor: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

interface CreateRegimeAlimentacaoData {
  hotel_id: string
  nome: string
  descricao?: string | null
  cor?: string
  ativo?: boolean
}

interface UpdateRegimeAlimentacaoData {
  nome?: string
  descricao?: string | null
  cor?: string
  ativo?: boolean
}
```

### 1.2. Atualização do Contrato `Tarifario`

Adição do campo mandatório `regime_alimentacao_id`:

```typescript
interface Tarifario {
  id: string
  hotel_id: string
  categoria_quarto_id: string
  regime_alimentacao_id: string // NOVO: Obrigatório
  nome: string
  valor_diaria: number
  ativo: boolean
  datas: string[]
  categoria_quarto?: CategoriaQuarto
  regime_alimentacao?: RegimeAlimentacao // NOVO: Relacionamento incluído
  created_at: Date
  updated_at: Date
}
```

## 2. Modelo Relacional no Prisma (`packages/api/src/prisma/schema.prisma`)

```prisma
model RegimeAlimentacao {
  id         String      @id @default(uuid())
  hotel_id   String
  nome       String      @db.VarChar(100)
  descricao  String?     @db.VarChar(255)
  cor        String      @default("#3b82f6") @db.VarChar(7)
  ativo      Boolean     @default(true)
  created_at DateTime    @default(now())
  updated_at DateTime    @updatedAt
  hotel      Hotel       @relation(fields: [hotel_id], references: [id], onDelete: Cascade)
  tarifarios Tarifario[]

  @@unique([hotel_id, nome])
  @@index([hotel_id])
  @@map("regimes_alimentacao")
}

model Tarifario {
  id                    String            @id @default(uuid())
  hotel_id              String
  categoria_quarto_id   String
  regime_alimentacao_id String            // FK NOT NULL
  // ... outros campos
  regime_alimentacao    RegimeAlimentacao @relation(fields: [regime_alimentacao_id], references: [id], onDelete: Restrict)

  @@index([regime_alimentacao_id])
  @@map("tarifarios")
}
```

## 3. Invariantes de Negócio

1. **Unicidade de Nome por Hotel**: Um mesmo hotel não pode cadastrar dois regimes de alimentação com o mesmo nome (comparação insensível a maiúsculas/minúsculas).
2. **Obrigatoriedade em Tarifários**: Todo tarifário deve obrigatoriamente referenciar um `regime_alimentacao_id` ativo no momento do cadastro.
3. **Restrição de Exclusão Física**: Regimes de alimentação não podem ser deletados fisicamente do banco se houver tarifários vinculados (`onDelete: Restrict`).
4. **Formato de Cor**: A cor deve seguir rigorosamente a sintaxe hexadecimal `#RRGGBB` (7 caracteres).
