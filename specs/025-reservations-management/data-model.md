# Data Model: Gestão de Reservas com Ficha de Hóspedes (FNRH)

## 1. Prisma (`packages/api/src/prisma/schema.prisma`)

```prisma
model Reserva {
  id                    String   @id @default(uuid())
  hotel_id              String
  codigo                String   @db.VarChar(20)   // ex.: R-000123, único por hotel
  titular_nome          String   @db.VarChar(150)
  titular_telefone      String?  @db.VarChar(30)
  titular_email         String?  @db.VarChar(150)
  quarto_id             String
  regime_alimentacao_id String
  parceiro_comercial_id String?
  check_in              DateTime @db.Date
  check_out             DateTime @db.Date
  quantidade_adultos    Int
  quantidade_criancas   Int      @default(0)
  valor_total           Decimal  @db.Decimal(12, 2)
  detalhamento_diarias  Json     // congelado na criação/edição (FR-003)
  status                String   @default("a_confirmar") @db.VarChar(20)
  token_fnrh            String   @unique @db.VarChar(64)
  token_fnrh_ativo      Boolean  @default(true)
  fnrh_enviada_em       DateTime?
  observacoes           String?  @db.Text
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  hotel                 Hotel              @relation(...)
  quarto                Quarto             @relation(..., onDelete: Restrict)
  regime_alimentacao    RegimeAlimentacao  @relation(..., onDelete: Restrict)
  parceiro_comercial    ParceiroComercial? @relation(..., onDelete: SetNull)
  hospedes              ReservaHospede[]
  historico_status      ReservaStatusHistorico[]

  @@unique([hotel_id, codigo])
  @@index([hotel_id, status])
  @@index([hotel_id, check_in])
  @@index([quarto_id, check_in, check_out])
  @@index([parceiro_comercial_id])
  @@map("reservas")
}

model ReservaHospede {
  id               String   @id @default(uuid())
  reserva_id       String
  posicao          Int      // 1..N; 1 = titular/responsável
  ficha_status     String   @default("pendente") @db.VarChar(12) // pendente|rascunho|preenchida
  preenchido_por   String?  @db.VarChar(10)                       // cliente|hotel
  preenchido_em    DateTime?

  // FNRH — todos anuláveis até a ficha ser concluída
  nome_completo       String?  @db.VarChar(150)
  nacionalidade       String?  @db.VarChar(60)
  data_nascimento     DateTime? @db.Date
  sexo                String?  @db.VarChar(15)
  profissao           String?  @db.VarChar(80)
  tipo_documento      String?  @db.VarChar(15)
  numero_documento    String?  @db.VarChar(30)
  logradouro          String?  @db.VarChar(120)
  numero_endereco     String?  @db.VarChar(20)
  complemento         String?  @db.VarChar(50)
  bairro              String?  @db.VarChar(60)
  cidade              String?  @db.VarChar(60)
  estado              String?  @db.VarChar(2)
  cep                 String?  @db.VarChar(10)
  pais_residencia     String?  @db.VarChar(60)
  telefone            String?  @db.VarChar(30)
  email               String?  @db.VarChar(150)
  motivo_viagem       String?  @db.VarChar(30)
  meio_transporte     String?  @db.VarChar(30)
  procedencia         String?  @db.VarChar(100)
  proximo_destino     String?  @db.VarChar(100)
  responsavel_posicao Int?     // posição do responsável quando menor de idade

  reserva Reserva @relation(..., onDelete: Cascade)

  @@unique([reserva_id, posicao])
  @@map("reserva_hospedes")
}

model ReservaStatusHistorico {
  id              String   @id @default(uuid())
  reserva_id      String
  status_anterior String?  @db.VarChar(20)
  status_novo     String   @db.VarChar(20)
  user_id         String?
  created_at      DateTime @default(now())

  reserva Reserva @relation(..., onDelete: Cascade)

  @@index([reserva_id])
  @@map("reserva_status_historico")
}
```

### Migração SQL manual (além do gerado pelo Prisma)

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservas ADD CONSTRAINT reservas_sem_conflito_quarto
  EXCLUDE USING gist (
    quarto_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('a_confirmar', 'confirmada', 'check_in', 'check_out'));

ALTER TABLE reservas ADD CONSTRAINT reservas_periodo_valido CHECK (check_out > check_in);
```

## 2. Regras de validação

| Regra | Origem |
|---|---|
| `titular_nome` obrigatório; telefone/e-mail opcionais, formato validado se presentes | FR-001/001a |
| `check_out > check_in`; pessoas ≥ 1 e ≤ `quarto.limite_hospedes` | FR-004 |
| Quarto e regime ativos; tarifa cobre todas as noites (senão `TarifarioSemCoberturaError`) | FR-002 |
| Sem conflito de quarto em período sobreposto entre status ativos | FR-004a |
| Parceiro, se informado, existe no hotel e está ativo | FR-006 |
| `hospedes` = exatamente `adultos + criancas` posições; posição 1 = titular | FR-007 |
| Ficha `preenchida` exige nome, nacionalidade, nascimento, sexo, documento, contato, motivo, transporte, procedência, destino; endereço completo se residente no Brasil, senão `pais_residencia`; CPF com dígitos verificadores válidos; menor de 18 sem documento exige `responsavel_posicao` | FR-013/014 |
| "Enviar ao hotel" só quando todas as fichas estão `preenchida` | FR-015 |

## 3. Transições de status (`ReservaStatusService`)

```text
a_confirmar ──► confirmada ──► check_in ──► check_out
     │              ├──────────► no_show
     └──► cancelada ◄┘
```

- Finais: `cancelada`, `no_show`, `check_out`.
- `cancelada`/`no_show`: liberam a suíte (fora do filtro da exclusion constraint) e desativam o link.
- Link público ativo apenas em `a_confirmar`, `confirmada`, `check_in`.

## 4. Ciclo de vida da ficha

`pendente → rascunho` (cliente/hotel salva incompleto) `→ preenchida` (validação completa). Edição posterior mantém `preenchida` se válida; reenvio atualiza `fnrh_enviada_em`.
