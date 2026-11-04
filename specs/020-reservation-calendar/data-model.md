# Data Model: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

## 1. Tipos de Entidades do Calendário (`reservations_context.tsx`)

### 1.1. `RoomStatus`

Situação operacional física e de governança do quarto.

| Status | Cor | Descrição |
|---|---|---|
| `'disponivel'` | Verde (`bg-green-500`) | Quarto limpo e liberado para ocupação |
| `'bloqueado'` | Vermelho (`bg-red-500`) | Quarto interditado administrativamente |
| `'manutencao'` | Laranja (`bg-orange-500`) | Quarto em reparos ou obras |
| `'limpeza'` | Azul (`bg-blue-500`) | Quarto aguardando ou em processo de higienização |
| `'ocupado'` | Roxo (`bg-purple-500`) | Quarto com hóspede presente |

### 1.2. `Room`

Representa a linha habitacional na grade.

```typescript
interface Room {
  id: string
  numero: string
  tipo: string
  status: RoomStatus
}
```

### 1.3. `Reservation`

Representa a estadia alocada no quarto.

```typescript
interface Reservation {
  id: string
  quartoId: string
  checkIn: string    // Formato ISO YYYY-MM-DD
  checkOut: string   // Formato ISO YYYY-MM-DD
  hospede: {
    nome: string
    email: string
    telefone: string
    documento: string
  }
  pagamento: {
    metodo: string
    valor: number
    status: 'Pago' | 'Pendente' | 'Parcial'
  }
  observacoes: string
  status: string      // 'Check In' | 'Confirmada' | 'Cancelada'
  status_code: number
}
```

## 2. Invariantes de Negócio do Mapa de Reservas

1. **Invariante de Sobreposição**: Duas reservas não podem ocupar o mesmo quarto e mesma noite intermediária. Em uma mesma data civil, é permitida exclusivamente a coincidência de término (check-out) de uma reserva com início (check-in) de outra.
2. **Invariante Temporal**: A data de `checkOut` é estritamente posterior à data de `checkIn` (`checkOut > checkIn`).
3. **Invariante de Navegação Passada**: Se o usuário selecionar um mês anterior à data atual, a grade ajusta a data inicial automaticamente para `hoje`.
