# Quickstart: Validação do Calendário Dinâmico de Reservas

## Como Executar os Testes Automatizados

Para rodar a suíte de testes do calendário no pacote `web`:

```bash
pnpm --filter web test src/pages/app/reservas/calendario.spec.tsx --run
```

## Cenários Principais de Validação

1. **Quartos Carregados da API**:
   - Quartos retornados por `quartosService.list` são exibidos com identificação (`101`, `102` etc.) e nome da categoria (`Standard`, `Deluxe` etc.).
   - Quarto com `status: 'N'` exibe ponto vermelho (`bg-status-blocked`) com tooltip "Bloqueado".
   - Quarto com check-in hoje exibe ponto roxo (`bg-status-occupied`) com tooltip "Ocupado".
   - Quarto disponível exibe ponto verde (`bg-status-available`) com tooltip "Disponível".

2. **Filtro de Reservas por Status**:
   - Reservas com status `a_confirmar`, `confirmada` e `check_in` aparecem na grade nas datas corretas.
   - Reservas com status `cancelada`, `check_out` e `no_show` NÃO são renderizadas.

3. **Cores das Barras de Reserva**:
   - `check_in` exibe cor sólida (`bg-primary`).
   - `confirmada` e `a_confirmar` exibem cor translúcida (`bg-primary/50`).

4. **Modal de Detalhes da Reserva**:
   - Clicar sobre a barra da reserva abre o modal contendo os dados do hóspede, número do quarto, período e valor.
