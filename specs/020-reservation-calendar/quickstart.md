# Quickstart & Validation Guide: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

## 1. Pré-requisitos

- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Executa os testes automatizados da página de calendário de reservas
pnpm --filter web test run src/pages/app/reservas/calendario.spec.tsx
```

## 3. Roteiro de Validação Manual

1. **Acesso ao Calendário**:
   - Acesse `/reservas/calendario` (ou `/reservas`).
   - Verifique a exibição da tabela de quartos à esquerda e dos dias consecutivos no cabeçalho.
   - O dia atual deve estar visualmente destacado com fundo translúcido suave (`bg-primary/10`).
2. **Navegação de Datas**:
   - Clique em `>` (próximo dia) e `<` (dia anterior); observe o deslocamento de 1 dia na grade.
   - Clique em `>>` (avançar 15 dias) e `<<` (voltar 15 dias); a grade se desloca em 15 dias.
   - Altere o mês para "Julho" e o ano para "2027"; a grade pula para o primeiro dia do mês escolhido.
3. **Reserva Consecutiva e Células Meio a Meio**:
   - Localize o quarto 101: verifique que no dia de transição uma reserva ocupa a metade esquerda (saída) e outra reserva ocupa a metade direita (entrada).
4. **Modal de Detalhes da Reserva**:
   - Clique em uma célula com reserva.
   - O modal "Detalhes da Reserva" deve abrir exibindo nome, e-mail, telefone, CPF, quarto, datas, valor e status de pagamento.
   - Feche o modal clicando no `X` ou fora do diálogo.
5. **Sobreposição da Barra Lateral**:
   - Abra a barra lateral de navegação com o calendário na tela.
   - Verifique que a barra lateral sobrepõe suavemente toda a tabela sem que colunas ou cabeçalhos fixos vazem sobre o menu.
