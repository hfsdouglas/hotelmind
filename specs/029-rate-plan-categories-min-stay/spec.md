# Feature Specification: Seleção Multi-Categoria, Estadia Mínima e Máscara de Valor no Tarifário

**Feature Branch**: `029-rate-plan-categories-min-stay`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Crie uma freature que permita selecionar mais de uma categoria de quarto (utilizar os cards padrões do orçamento/reservas), criar uma etapa no tarifário específicamente para a escolha das categorias. O tarifário deve permitir inserir o a quantidade mínima de diárias para um determinado período. Por exemplo, o hoteleiro pode exigir que no fim de semana, só seja possível reservar duas diárias - de sexta a domingo. E corrigir máscara de dinheiro no input de valor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Etapa Dedicada com Seleção Multi-Categoria via Cards Padrões (Priority: P1)

Como hoteleiro ou operador da recepção, desejo configurar um único tarifário que se aplique simultaneamente a múltiplas categorias de acomodações (ou a todas), utilizando uma etapa visual dedicada no formulário com os cards padronizados do sistema de reservas e orçamentos, para que eu não precise duplicar o cadastro do mesmo tarifário manualmente categoria por categoria.

**Why this priority**: É o cerne do ganho de produtividade operacional do hoteleiro, eliminando retrabalho no cadastro de tarifas e padronizando a experiência visual entre orçamentos, reservas e tarifários.

**Independent Test**: Pode ser testado de ponta a ponta acessando a tela de novo tarifário, preenchendo os dados básicos, navegando até a etapa dedicada de categorias, selecionando dois ou mais cards de categoria, definindo as datas/valores e confirmando o salvamento.

**Acceptance Scenarios**:

1. **Given** que o hoteleiro está criando um tarifário e preenche o nome e regime de alimentação no Passo 1, **When** ele avança para o Passo 2 (Categorias de Quarto), **Then** ele visualiza todas as categorias ativas em formato de cards visuais consistentes com os de orçamentos/reservas (nome, capacidade de hóspedes, badge de status).
2. **Given** que a lista de cards de categorias é exibida, **When** o hoteleiro clica em um ou mais cards, **Then** os cards alternam o estado visual para selecionado (borda destacada, indicador de marcação) e exibem o resumo da quantidade de categorias selecionadas.
3. **Given** que o hoteleiro deseja aplicar a tarifa a todas as categorias disponíveis, **When** ele clica no botão "Selecionar todas", **Then** todas as categorias ativas passam para o estado selecionado simultaneamente.
4. **Given** que o formulário é submetido sem nenhuma categoria selecionada, **When** a validação é executada, **Then** o sistema bloqueia o envio e exibe mensagem clara exigindo a seleção de pelo menos uma categoria.

---

### User Story 2 - Definição e Validação de Estadia Mínima (Quantidade Mínima de Diárias) (Priority: P2)

Como hoteleiro, desejo configurar uma quantidade mínima de diárias para um período tarifário (por exemplo, exigência de 2 diárias em fins de semana ou 3 diárias em pacotes de feriado), para que o hotel garanta sua taxa de ocupação e rentabilidade mínima sem aceitar estadias fracionadas nesses períodos.

**Why this priority**: É uma regra comercial crítica no setor hoteleiro (restrição de estadias em fins de semana e feriados), assegurando que o motor de reservas e orçamentos respeite os limites mínimos de faturamento estipulados pela gerência.

**Independent Test**: Pode ser testado criando um tarifário com estadia mínima de 2 diárias para datas específicas e, em seguida, simulando um orçamento de 1 diária para esse período, verificando que o sistema impede a reserva ou avisa que a estadia mínima não foi atendida.

**Acceptance Scenarios**:

1. **Given** que o hoteleiro está configurando os valores e condições do tarifário, **When** ele visualiza o campo de estadia mínima, **Then** o valor padrão sugerido é 1 diária, permitindo alteração para qualquer número inteiro igual ou superior a 1.
2. **Given** um tarifário salvo com quantidade mínima de 2 diárias para sexta e sábado, **When** um hóspede ou atendente tenta cotar ou reservar apenas 1 diária (ex.: somente sexta-feira para sábado), **Then** a acomodação é considerada indisponível para o período de 1 noite com a justificativa de não atingir a estadia mínima de 2 noites.
3. **Given** o mesmo tarifário de 2 diárias mínimas, **When** a solicitação é de 2 ou mais noites compreendendo o período (ex.: de sexta a domingo), **Then** o tarifário é aplicado normalmente e o valor total calculado com sucesso.

---

### User Story 3 - Máscara Monetária Precisa e Amigável no Campo de Valor (Priority: P3)

Como operador preenchendo o tarifário, desejo que o campo de valor da diária possua uma máscara monetária intuitiva em padrão Real brasileiro (R$), formatando dígitos e separadores de milhar/centavos em tempo real conforme a digitação, para evitar erros de digitação de valores (como casas decimais incorretas ou valores exorbitantes).

**Why this priority**: Evita inconsistências de valores e falhas em navegadores móveis/desktop decorrentes de campos numéricos sem formatação nativa ou máscaras instáveis.

**Independent Test**: Pode ser testado digitando números no campo de valor da diária, verificando a formatação visual automática (`R$ 150,00`), testando deleções parciais e confirmando a persistência com valor decimal normalizado.

**Acceptance Scenarios**:

1. **Given** o campo de valor da diária vazio, **When** o operador digita `15000`, **Then** o campo exibe imediatamente `R$ 150,00` de forma legível e sem quebras de layout.
2. **Given** um valor formatado no campo, **When** o formulário é submetido, **Then** o sistema processa o valor monetário normalizado para cálculo e persistência sem ambiguidades entre vírgula e ponto decimal.
3. **Given** a edição de um tarifário existente com valor cadastrado (ex.: 220.50), **When** a tela é carregada, **Then** o campo exibe `R$ 220,50` devidamente mascarado e pronto para nova edição.

---

### Edge Cases

- **Conflito de datas em apenas uma das categorias selecionadas**: Se um tarifário for cadastrado para 3 categorias (Standard, Luxo, Suíte Master) e a categoria Luxo já possuir um tarifário ativo para uma daquelas datas, o sistema deve alertar com precisão que a categoria Luxo apresenta sobreposição de período, identificando o tarifário conflitante.
- **Tarifário histórico com categoria única**: Tarifários existentes cadastrados antes desta funcionalidade devem continuar sendo visualizados e editados sem perda de integridade.
- **Períodos com tarifas de estadias mínimas distintas**: Se a estadia solicitada englobar dias sujeitos a dois tarifários com exigências mínimas diferentes (ex.: quinta-feira com mínimo de 1 diária e sexta-feira com mínimo de 2 diárias), a estadia total deve cumprir a maior exigência mínima aplicável às noites reservadas.
- **Entrada de valor zero ou negativo**: O campo de valor com máscara não deve permitir valores negativos, e o valor zero só deve ser aceito se explicitamente configurado pelo estabelecimento (caso contrário, exigir valor maior que zero).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma etapa específica e sequencial no formulário de tarifários (Passo 2) exclusivamente dedicada à seleção de categorias de quarto.
- **FR-002**: O sistema DEVE renderizar as categorias de acomodação ativas utilizando os mesmos cards padronizados da área de orçamentos e reservas, contendo título da categoria e capacidade de hóspedes.
- **FR-003**: O sistema DEVE permitir a seleção de múltiplas categorias simultaneamente (uma, várias ou todas) para o mesmo tarifário.
- **FR-004**: O sistema DEVE fornecer controles de ação rápida para "Selecionar todas" e "Desmarcar todas" as categorias disponíveis.
- **FR-005**: O sistema DEVE validar que pelo menos uma categoria esteja selecionada antes de permitir a submissão do tarifário.
- **FR-006**: O sistema DEVE incluir no cadastro de tarifário o campo "Quantidade mínima de diárias" (estadia mínima), com valor numérico inteiro maior ou igual a 1 e valor padrão 1.
- **FR-007**: O motor de cálculo de orçamentos e reservas DEVE verificar a quantidade mínima de diárias configurada nos tarifários aplicáveis ao período selecionado; caso o número de noites da reserva seja inferior ao mínimo exigido, a acomodação DEVE ser sinalizada como restrita/indisponível para aquele período com mensagem explicativa.
- **FR-008**: O campo de valor da diária DEVE aplicar máscara monetária no padrão Real brasileiro (R$), formatando moeda com duas casas decimais em tempo real conforme o usuário digita.
- **FR-009**: O sistema DEVE garantir a validação de conflitos de datas para todas as categorias selecionadas, assegurando que não haja sobreposição de tarifários ativos para uma mesma categoria e parceiro comercial nas datas indicadas.
- **FR-010**: A tela de listagem de tarifários DEVE exibir com clareza as categorias às quais o tarifário se aplica (ex.: nome da categoria ou indicação de "Múltiplas categorias (N)").

### Key Entities *(include if feature involves data)*

- **Tarifario**: Registro do tarifário contendo identificador, hotel, regime de alimentação, parceiro comercial (opcional), nome, valor da diária, quantidade mínima de diárias (`minimo_diarias`), situação (ativo/inativo) e datas vigentes.
- **TarifarioCategoria**: Relação de associação entre um tarifário e uma ou mais categorias de acomodação cobertas por aquele tarifário.
- **CategoriaQuarto**: Entidade de acomodação existente contendo nome, capacidade de ocupação e status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo necessário para um operador cadastrar uma tarifa aplicável a 4 categorias de quartos é reduzido em pelo menos 60% (de 4 cadastros individuais para 1 cadastro unificado).
- **SC-002**: 100% dos orçamentos e reservas respeitam a regra de quantidade mínima de diárias estipulada no tarifário, sem aceitar reservas com noites insuficientes.
- **SC-003**: 0% de erros de digitação de casas decimais reportados no valor da diária após a implementação da máscara monetária automatizada.
- **SC-004**: Hoteleiros e recepcionistas conseguem identificar visualmente as categorias selecionadas em menos de 2 segundos devido à consistência dos cards visuais.

## Assumptions

- O hotel opera sob moeda padrão BRL (Real brasileiro) para todas as configurações de diárias em território nacional.
- As categorias de quartos desativadas (`status: 'N'`) não aparecem para nova seleção na etapa de categorias, mas permanecem preservadas em tarifários históricos.
- Quando o hoteleiro altera as categorias selecionadas em um tarifário em edição, as verificações de conflito no calendário são recalculadas em tempo real para o conjunto de categorias selecionado.
