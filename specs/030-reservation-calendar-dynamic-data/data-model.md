# Data Model: Dados Dinâmicos no Calendário de Reservas

## Context & Models

A interface do calendário consome os modelos contratuais de `Quarto` e `Reserva` definidos em `@hotelmind/contracts`.

### 1. Modelo de Entrada de Quartos (`Quarto` em `@hotelmind/contracts`)

```typescript
export interface Quarto {
  id: string
  hotel_id: string
  categoria_id: string
  identificacao: string          // Ex.: "101", "102"
  descricao: string | null
  limite_hospedes: number
  status: 'S' | 'N'             // 'S' = Ativo, 'N' = Inativo / Bloqueado
  categoria: {
    id: string
    nome: string                // Ex.: "Standard", "Deluxe", "Suite"
    status: 'S' | 'N'
  }
  camas: ConfiguracaoCama[]
  created_at: string
  updated_at: string
}
```

### 2. Modelo de Entrada de Reservas (`Reserva` em `@hotelmind/contracts`)

```typescript
export type ReservaStatus =
  | 'a_confirmar'
  | 'confirmada'
  | 'check_in'
  | 'check_out'
  | 'no_show'
  | 'cancelada'

export interface Reserva {
  id: string
  hotel_id: string
  codigo: string
  titular_nome: string
  titular_telefone: string | null
  titular_email: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_id: string | null
  check_in: string               // "YYYY-MM-DD"
  check_out: string              // "YYYY-MM-DD"
  quantidade_adultos: number
  quantidade_criancas: number
  valor_total: string
  detalhamento_diarias: DiariaReserva[]
  status: ReservaStatus
  observacoes: string | null
  quarto?: { id: string; identificacao: string; categoria_nome: string }
  hospedes?: Hospede[]
}
```

### 3. Modelo Mapeado para o Calendário (`Room` & `Reservation`)

```typescript
export type RoomStatus =
  | 'disponivel'
  | 'bloqueado'
  | 'manutencao'
  | 'limpeza'
  | 'ocupado'

export interface Room {
  id: string
  numero: string                 // Mapeado de Quarto.identificacao
  tipo: string                   // Mapeado de Quarto.categoria.nome
  status: RoomStatus             // Calculado: 'bloqueado' se Quarto.status === 'N', 'ocupado' se hóspede com check_in hoje, 'disponivel' caso contrário
}

export interface Reservation {
  id: string
  quartoId: string               // Mapeado de Reserva.quarto_id
  checkIn: string                // Normalizado: "YYYY-MM-DDT00:00:00"
  checkOut: string               // Normalizado: "YYYY-MM-DDT00:00:00"
  hospede: {
    nome: string                 // Reserva.titular_nome
    email: string                // Reserva.titular_email || '-'
    telefone: string             // Reserva.titular_telefone || '-'
    documento: string            // Reserva.hospedes?.[0]?.numero_documento || '-'
  }
  pagamento: {
    metodo: string               // Ex.: "Parceiro: ..." ou "Balcão / Reserva Direta"
    valor: number                // Number(Reserva.valor_total)
    status: string               // 'Pago' se status === 'check_in', 'Pendente' caso contrário
  }
  observacoes?: string           // Reserva.observacoes
  status: string                 // "Check In", "Confirmada", "A Confirmar"
  status_code: number            // 1 para 'check_in' (bg-primary), 0 para 'confirmada'/'a_confirmar' (bg-primary/50)
}
```

## Regras de Filtragem de Status

| Status na Reserva (`ReservaStatus`) | Exibir no Calendário? | Representação Visual (`status_code` / classe CSS) |
|---|---|---|
| `check_in` | **SIM** | `status_code: 1` (`bg-primary`) |
| `confirmada` | **SIM** | `status_code: 0` (`bg-primary/50`) |
| `a_confirmar` | **SIM** | `status_code: 0` (`bg-primary/50`) |
| `check_out` | **NÃO** | Omitida / Não renderizada |
| `cancelada` | **NÃO** | Omitida / Não renderizada |
| `no_show` | **NÃO** | Omitida / Não renderizada |
