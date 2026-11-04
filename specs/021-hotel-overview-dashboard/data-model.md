# Data Model: Painel de Visão Geral Operacional e Métricas Hoteleiras

## 1. Estruturas de Dados do Painel (`DashboardData`)

Estrutura de dados que abastece a visualização da tela `VisaoGeral`:

```typescript
interface DashboardData {
  totalPessoas: number
  totalCriancas: number
  taxaOcupacao: number
  reservasConfirmadas: number
  checkInsHoje: number
  checkOutsHoje: number
  quartosOcupados: number
  quartosDisponiveis: number
  pessoasPorRegime: RegimeAlimentacaoBreakdown[]
  distribuicaoPorTipo: QuartoTipoBreakdown[]
}

interface RegimeAlimentacaoBreakdown {
  regime: string        // ex.: 'Café da Manhã', 'Meia Pensão', 'Pensão Completa', 'Sem Refeição'
  quantidade: number    // Contagem de hóspedes
}

interface QuartoTipoBreakdown {
  tipo: string          // ex.: 'Standard', 'Deluxe', 'Suite', 'Premium'
  quantidade: number    // Contagem de unidades ocupadas
}
```

## 2. Invariantes de Negócio e Coerência de Métricas

1. **Taxa de Ocupação**: Representa a proporção percentual de quartos ocupados em relação à capacidade total do hotel (`(quartosOcupados / totalQuartos) * 100`).
2. **Proporção Alimentar**: A soma das porcentagens das barras de progresso de regimes alimentares não ultrapassa 100% do `totalPessoas`.
3. **Formatação de Datas**: A data selecionada é manipulada em horário local zerado (`setHours(0, 0, 0, 0)`), evitando desvios de timezone.
