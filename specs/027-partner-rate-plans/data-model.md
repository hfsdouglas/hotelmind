# Phase 1 Data Model: Tarifários Vinculados a Parceiros Comerciais

## 1. Entidades de Domínio

### Tarifario
Representa a precificação diária de uma categoria de quarto sob determinado regime de alimentação, associada opcionalmente a um parceiro comercial.

| Campo | Tipo | Obrigatoriedade | Descrição |
|---|---|---|---|
| `id` | UUID | Obrigatório | Identificador único do tarifário |
| `hotel_id` | UUID | Obrigatório | Tenant / hotel proprietário |
| `parceiro_id` | UUID | Opcional (nullable) | ID do parceiro comercial vinculado. Se nulo, é tarifa pública padrão. |
| `categoria_quarto_id` | UUID | Obrigatório | Categoria da suíte precificada |
| `regime_alimentacao_id`| UUID | Obrigatório | Regime de alimentação aplicável |
| `nome` | String(100) | Obrigatório | Título identificador (ex.: "Tarifa Corporativa Petrobras 2026") |
| `valor_diaria` | Decimal(12, 2) | Obrigatório | Valor monetário por diária (ex.: "450.00") |
| `datas` | Date[] | Obrigatório | Lista de datas específicas em que o tarifário é válido |
| `ativo` | Boolean | Obrigatório (default: true) | Indicador se o tarifário está ativo para cotação |
| `criado_em` | DateTime | Obrigatório | Timestamp de criação |
| `atualizado_em` | DateTime | Obrigatório | Timestamp da última modificação |

**Relações**:
- `Hotel` (1:N)
- `Parceiro` (N:1, opcional, onDelete: Cascade ou SetNull)
- `CategoriaQuarto` (N:1, onDelete: Restrict)
- `RegimeAlimentacao` (N:1, onDelete: Restrict)
- `TarifarioData` (1:N, datas associadas, onDelete: Cascade)

**Regras de Invariante & Validação**:
- Se `parceiro_id` for informado, o parceiro deve existir e pertencer ao mesmo `hotel_id`.
- Se o parceiro estiver com status "bloqueado" ou "inativo", novas reservas/orçamentos não podem utilizar o tarifário.
- Duplicidade/Conflito de datas ativas: Não pode haver dois tarifários ativos para a mesma data, mesma categoria, mesmo regime e mesmo `parceiro_id` (onde `parceiro_id == null` é seu próprio escopo).

---

### Orcamento
Representa uma cotação prévia emitida para um lead ou parceiro.

| Campo | Tipo | Obrigatoriedade | Descrição |
|---|---|---|---|
| `id` | UUID | Obrigatório | Identificador único do orçamento |
| `hotel_id` | UUID | Obrigatório | Tenant / hotel |
| `parceiro_id` | UUID | Opcional (nullable) | Parceiro comercial indicado no orçamento |
| `lead_id` | UUID | Obrigatório | Lead / titular do orçamento |
| `regime_alimentacao_id` | UUID | Obrigatório | Regime de alimentação selecionado |
| `categoria_quarto_id` | UUID | Obrigatório | Categoria de quarto selecionada |
| `check_in` | String (YYYY-MM-DD) | Obrigatório | Data de entrada |
| `check_out` | String (YYYY-MM-DD) | Obrigatório | Data de saída |
| `quantidade_adultos` | Int | Obrigatório (min: 1) | Total de adultos |
| `quantidade_criancas` | Int | Obrigatório (default: 0) | Total de crianças |
| `quantidade_pets` | Int | Obrigatório (default: 0) | Total de animais |
| `valor_total` | String/Decimal | Obrigatório | Soma calculada das diárias |
| `detalhamento_noites` | Json | Obrigatório | Array com cada noite calculada, nome e valor do tarifário |
| `token_publico` | String(64) | Obrigatório (unique) | Token de visualização pública |
| `status` | String(20) | Obrigatório | 'pendente', 'aprovado', 'cancelado', 'expirado' |

**Relações**:
- `Hotel` (1:N)
- `Parceiro` (N:1, opcional, onDelete: SetNull)
- `Lead` (N:1, onDelete: Restrict)
- `RegimeAlimentacao` (N:1, onDelete: Restrict)
- `CategoriaQuarto` (N:1, onDelete: Restrict)

---

### Reserva
Reserva confirmada de quarto físico.

| Campo Relevante | Tipo | Descrição |
|---|---|---|
| `parceiro_id` | UUID (nullable) | Já existente no schema. O parceiro restringe as suítes e tarifas aplicáveis no cálculo. |
| `quarto_id` | UUID | Quarto físico alocado, que deve pertencer a uma categoria com tarifa ativa do parceiro. |
| `detalhamento_diarias` | Json | Detalhamento das diárias precificadas com o tarifário do parceiro. |

---

## 2. Alterações de Schema do Prisma

```prisma
// Em packages/api/src/prisma/schema.prisma

model Tarifario {
  id                    String            @id @default(uuid())
  hotel_id              String
  hotel                 Hotel             @relation(fields: [hotel_id], references: [id], onDelete: Cascade)
  categoria_quarto_id   String
  categoria_quarto      CategoriaQuarto  @relation(fields: [categoria_quarto_id], references: [id], onDelete: Restrict)
  regime_alimentacao_id String
  regime_alimentacao    RegimeAlimentacao @relation(fields: [regime_alimentacao_id], references: [id], onDelete: Restrict)
  parceiro_id           String?
  parceiro              Parceiro?         @relation(fields: [parceiro_id], references: [id], onDelete: Cascade)
  nome                  String            @db.VarChar(100)
  valor_diaria          Decimal           @db.Decimal(12, 2)
  ativo                 Boolean           @default(true)
  datas                 TarifarioData[]
  criado_em             DateTime          @default(now())
  atualizado_em         DateTime          @updatedAt

  @@index([hotel_id])
  @@index([categoria_quarto_id])
  @@index([regime_alimentacao_id])
  @@index([parceiro_id])
  @@index([hotel_id, categoria_quarto_id, ativo])
  @@index([hotel_id, parceiro_id, ativo])
  @@map("tarifarios")
}

model Orcamento {
  id                    String            @id @default(uuid())
  hotel_id              String
  lead_id               String
  regime_alimentacao_id String
  categoria_quarto_id   String
  parceiro_id           String?
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
  cupom_desconto        String?           @db.VarChar(50)
  created_at            DateTime          @default(now())
  updated_at            DateTime          @updatedAt

  hotel                 Hotel             @relation(fields: [hotel_id], references: [id], onDelete: Cascade)
  lead                  Lead              @relation(fields: [lead_id], references: [id], onDelete: Restrict)
  regime_alimentacao    RegimeAlimentacao @relation(fields: [regime_alimentacao_id], references: [id], onDelete: Restrict)
  categoria_quarto      CategoriaQuarto   @relation(fields: [categoria_quarto_id], references: [id], onDelete: Restrict)
  parceiro              Parceiro?         @relation(fields: [parceiro_id], references: [id], onDelete: SetNull)

  @@index([hotel_id])
  @@index([hotel_id, status])
  @@index([parceiro_id])
  @@index([lead_id])
  @@index([token_publico])
  @@map("orcamentos")
}

model Parceiro {
  // campos existentes...
  tarifarios   Tarifario[]
  orcamentos   Orcamento[]
  reservas     Reserva[]
  // ...
}
```
