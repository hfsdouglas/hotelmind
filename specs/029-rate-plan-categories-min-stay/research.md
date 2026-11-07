# Phase 0 Research: Seleção Multi-Categoria, Estadia Mínima e Máscara Monetária

## Research Findings & Architectural Decisions

### 1. Modelagem da Relação Multi-Categoria (Tarifário ↔ Categorias de Quarto)

- **Decisão**: Criar tabela associativa `tarifarios_categorias_quartos` no PostgreSQL via Prisma com chave composta única `@@unique([tarifario_id, categoria_quarto_id])` e exclusão em cascata no tarifário (`onDelete: Cascade`), mantendo integridade referencial restrita na categoria (`onDelete: Restrict`).
- **Retrocompatibilidade**: Manter o campo `categoria_quarto_id` como opcional na tabela `tarifarios` durante a transição, garantindo que consultas legadas continuem funcionando enquanto a relação oficial passa a ser gerenciada via `tarifarios_categorias_quartos`.
- **Alternativas consideradas**:
  - *Criar N registros clonados de tarifário para cada categoria*: Rejeitado porque quebra a intenção do usuário de editar e gerenciar uma única tarifa que rege múltiplas categorias simultaneamente.
  - *Array de IDs em coluna JSONB/Text[]*: Rejeitado por violar a 1ª Forma Normal, dificultar constraints de chave estrangeira no PostgreSQL e comprometer índices relacionais de alta performance.

### 2. Regra de Estadia Mínima (`minimo_diarias`)

- **Decisão**: Adicionar coluna `minimo_diarias Int @default(1)` ao modelo `Tarifario`.
  - O valor padrão é 1 (sem restrição especial).
  - No `TarifarioPricingService` do backend e nas funções de precificação do frontend (`calculateCategoryTariff`), avaliar o comprimento do período solicitado (`nights.length`).
  - Se `nights.length < tarifario.minimo_diarias`, a tarifa não é elegível para cobrir a reserva/orçamento naquele período.
  - No frontend de orçamentos e reservas, caso uma categoria possua tarifa ativa mas com estadia mínima superior às noites informadas, exibir aviso amigável ("Estadia mínima de X diárias exigida para o período").
- **Alternativas consideradas**:
  - *Estadia mínima configurada por data*: Rejeitado neste momento para manter simplicidade e foco na regra solicitada ("o hoteleiro pode exigir que no tarifário do fim de semana só seja possível reservar duas diárias"). O tarifário já possui datas específicas associadas, atendendo perfeitamente ao caso de uso.

### 3. Cards Padronizados de Categorias de Quarto no Formulário

- **Decisão**: Criar o componente `TarifarioCategoryCards` (ou embutir de forma coesa em `tarifario_form.tsx`) espelhando o padrão visual dos cards de seleção de suítes de `orcamentos/novo.tsx` e `reservas/nova.tsx`:
  - Card responsivo com borda semântica, indicador de capacidade máxima de hóspedes, título da categoria e badge de status.
  - Feedback visual de seleção: `border-primary ring-2 ring-primary/20 bg-primary/5` com ícone de check (`CheckCircle2`).
  - Barra de ações rápidas: "Selecionar todas" e "Desmarcar todas", além de contador de categorias selecionadas ("3 de 5 selecionadas").
  - Validação no schema Zod do formulário: `categoria_quarto_ids: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma categoria de quarto.')`.

### 4. Máscara Monetária Precisa para o Input de Valor

- **Decisão**: Implementar a máscara de moeda brasileira baseada em centavos (padrão robusto para inputs monetários no Brasil):
  - Conforme o usuário digita números, o valor é interpretado em centavos (ex.: digitação `1` -> `0,01`, `15` -> `0,15`, `150` -> `1,50`, `15000` -> `150,00`).
  - Apresentação visual clara com prefixo `R$ `.
  - Fornece função de conversão bidirecional: string formatada (`"R$ 150,00"`) ↔ decimal numérico / string normalizada (`"150.00"`).
  - Schema de validação aceita e normaliza ambos os formatos de entrada sem erros de NaN.

### 5. Resolução de Conflitos de Período Multi-Categoria

- **Decisão**: No calendário de período ocupado (`find_conflicting_periods`), a verificação de sobreposição de datas passa a considerar as categorias selecionadas. Se qualquer uma das categorias selecionadas possuir outro tarifário ativo com datas coincidentes para o mesmo parceiro comercial, o conflito é detectado e listado com a categoria correspondente.
