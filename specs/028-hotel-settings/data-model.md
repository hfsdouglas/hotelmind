# Phase 1: Data Model Specification

**Feature**: Configurações > Hotel (Aplicação Web)
**Branch**: `028-hotel-settings`
**Date**: 2026-11-06

## 1. Entidades do Domínio

### 1.1 Entidade `HotelConfiguracao` (Tabela `hoteis_configuracoes`)

Representa as definições detalhadas de identidade, políticas e serviços do hotel locatário (tenant), com relação 1:1 estrita com o `Hotel`.

| Campo | Tipo Prisma | Nullable | Padrão | Descrição |
|---|---|---|---|---|
| `id` | String (@id @default(uuid())) | Não | uuid() | Chave primária |
| `created_at` | DateTime | Não | now() | Timestamp de criação |
| `updated_at` | DateTime | Não | @updatedAt | Timestamp de atualização |
| `hotel_id` | String (@unique) | Não | - | Chave estrangeira para `Hotel.id` |
| **Identidade & Branding** | | | | |
| `categoria` | String (@db.VarChar(50)) | Não | "HOTEL" | Categoria: HOTEL, POUSADA, RESORT, HOSTEL, FLAT |
| `classificacao_estrelas` | Int | Não | 0 | 0 = Sem classificação; 1 a 5 estrelas |
| `descricao_curta` | String? (@db.VarChar(160)) | Sim | null | Slogan / resumo até 160 chars |
| `descricao_completa` | String? (@db.Text) | Sim | null | Descrição institucional completa |
| `logo_primary` | String? (@db.Text) | Sim | null | URL ou Data URL do logo principal |
| `logo_dark` | String? (@db.Text) | Sim | null | URL ou Data URL do logo fundo escuro |
| `favicon` | String? (@db.Text) | Sim | null | URL ou Data URL do favicon |
| `color_primary` | String (@db.VarChar(7)) | Não | "#1e40af" | Cor primária (HEX) |
| `color_secondary` | String (@db.VarChar(7)) | Não | "#64748b" | Cor secundária (HEX) |
| `color_background` | String (@db.VarChar(7)) | Não | "#ffffff" | Cor de fundo (HEX) |
| `color_surface` | String (@db.VarChar(7)) | Não | "#f8fafc" | Cor de cartões/superfícies (HEX) |
| `color_text_primary` | String (@db.VarChar(7)) | Não | "#0f172a" | Cor texto primário (HEX) |
| `color_text_secondary` | String (@db.VarChar(7)) | Não | "#475569" | Cor texto secundário (HEX) |
| `color_accent` | String (@db.VarChar(7)) | Não | "#f59e0b" | Cor de destaque (HEX) |
| **Políticas de Crianças** | | | | |
| `free_child_age_limit` | Int | Não | 5 | Idade máxima para gratuidade (anos) |
| `free_child_max_per_room` | Int | Não | 1 | Máximo de crianças gratuitas por quarto |
| **Horários & Operação** | | | | |
| `checkin_time` | String (@db.VarChar(5)) | Não | "14:00" | Horário padrão de check-in (HH:mm) |
| `checkout_time` | String (@db.VarChar(5)) | Não | "12:00" | Horário padrão de check-out (HH:mm) |
| `reception_24h` | Boolean | Não | true | Funcionamento da recepção 24h |
| `reception_opening_time` | String? (@db.VarChar(5)) | Sim | null | Abertura da recepção se não for 24h |
| `reception_closing_time` | String? (@db.VarChar(5)) | Sim | null | Fechamento da recepção se não for 24h |
| **Regras da Casa (Pets e Fumo)** | | | | |
| `pet_friendly` | Boolean | Não | false | Aceita animais de estimação |
| `pet_max_weight_kg` | Decimal? (@db.Decimal(5, 2)) | Sim | null | Peso máximo permitido (kg) |
| `smoking_allowed` | Boolean | Não | false | Permite fumar em áreas fechadas |
| `smoking_sanitization_fee` | Decimal? (@db.Decimal(10, 2)) | Sim | null | Taxa de higienização por descumprimento |
| **Estacionamento & Wi-Fi** | | | | |
| `parking_type` | String (@db.VarChar(30)) | Não | "NAO_POSSUI" | GRATUITO, PAGO_LOCAL, CONVENIADO, NAO_POSSUI |
| `parking_fee_per_day` | Decimal? (@db.Decimal(10, 2)) | Sim | null | Valor por dia de estacionamento |
| `parking_reservation_required` | Boolean | Não | false | Requer reserva antecipada |
| `parking_covered` | String (@db.VarChar(20)) | Não | "DESCOBERTO" | COBERTO, DESCOBERTO, MISTO |
| `wifi_available` | Boolean | Não | true | Wi-Fi disponível |
| `wifi_type` | String (@db.VarChar(30)) | Não | "GRATUITO_TOTAL" | GRATUITO_TOTAL, GRATUITO_AREAS_COMUNS, PAGO |
| `wifi_ssid_default` | String? (@db.VarChar(100)) | Sim | null | Nome da rede Wi-Fi principal |
| `wifi_password_default` | String? (@db.VarChar(100)) | Sim | null | Senha da rede Wi-Fi |
| `wifi_show_on_voucher` | Boolean | Não | true | Exibir dados de Wi-Fi no voucher |

---

## 2. Relacionamento no Prisma Schema

```prisma
model Hotel {
  id                 String             @id @default(uuid())
  // ... campos existentes
  configuracao       HotelConfiguracao?
  // ...
  @@map("hoteis")
}

model HotelConfiguracao {
  id                 String    @id @default(uuid())
  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt
  hotel_id           String    @unique
  hotel              Hotel     @relation(fields: [hotel_id], references: [id], onDelete: Cascade)

  // Identidade & Tema
  categoria          String    @default("HOTEL") @db.VarChar(50)
  classificacao_estrelas Int   @default(0)
  descricao_curta    String?   @db.VarChar(160)
  descricao_completa String?   @db.Text
  logo_primary       String?   @db.Text
  logo_dark          String?   @db.Text
  favicon            String?   @db.Text
  color_primary      String    @default("#1e40af") @db.VarChar(7)
  color_secondary    String    @default("#64748b") @db.VarChar(7)
  color_background   String    @default("#ffffff") @db.VarChar(7)
  color_surface      String    @default("#f8fafc") @db.VarChar(7)
  color_text_primary String    @default("#0f172a") @db.VarChar(7)
  color_text_secondary String  @default("#475569") @db.VarChar(7)
  color_accent       String    @default("#f59e0b") @db.VarChar(7)

  // Crianças & Hóspedes Extras (apenas gratuidades)
  free_child_age_limit     Int     @default(5)
  free_child_max_per_room  Int     @default(1)

  // Horários & Operação
  checkin_time             String  @default("14:00") @db.VarChar(5)
  checkout_time            String  @default("12:00") @db.VarChar(5)
  reception_24h            Boolean @default(true)
  reception_opening_time   String? @db.VarChar(5)
  reception_closing_time   String? @db.VarChar(5)

  // Políticas & Regras (Pets e Fumo)
  pet_friendly             Boolean  @default(false)
  pet_max_weight_kg        Decimal? @db.Decimal(5, 2)
  smoking_allowed          Boolean  @default(false)
  smoking_sanitization_fee Decimal? @db.Decimal(10, 2)

  // Serviços Operacionais (Estacionamento & Wi-Fi)
  parking_type             String   @default("NAO_POSSUI") @db.VarChar(30)
  parking_fee_per_day      Decimal? @db.Decimal(10, 2)
  parking_reservation_required Boolean @default(false)
  parking_covered          String   @default("DESCOBERTO") @db.VarChar(20)
  wifi_available           Boolean  @default(true)
  wifi_type                String   @default("GRATUITO_TOTAL") @db.VarChar(30)
  wifi_ssid_default        String?  @db.VarChar(100)
  wifi_password_default    String?  @db.VarChar(100)
  wifi_show_on_voucher     Boolean  @default(true)

  @@index([hotel_id])
  @@map("hoteis_configuracoes")
}
```

---

## 3. Regras de Validação e Consistência

1. **Validação de Cores**: Cada valor em `color_*` deve seguir a expressão regular `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`.
2. **Gratuidade de Crianças**:
   - `free_child_age_limit` >= 0
   - `free_child_max_per_room` >= 0
3. **Recepção**: Se `reception_24h` for falso, `reception_opening_time` e `reception_closing_time` tornam-se de preenchimento obrigatório no formato `HH:mm`.
4. **Horários**: `checkin_time` e `checkout_time` devem ser no formato válido `HH:mm` (00:00 a 23:59).
5. **Pets**: Se `pet_friendly` for verdadeiro, `pet_max_weight_kg` é opcional, mas se fornecido deve ser > 0.
6. **Fumo**: Se `smoking_allowed` for falso, `smoking_sanitization_fee` se informada deve ser >= 0.
7. **Estacionamento**: Se `parking_type` for `PAGO_LOCAL`, `parking_fee_per_day` deve ser >= 0.
8. **Dados Institucionais**:
   - `nome_fantasia`: string não vazia (1-100 chars);
   - `cnpj`: 14 caracteres numéricos válidos.
