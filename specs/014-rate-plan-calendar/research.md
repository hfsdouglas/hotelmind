# Research — Gestão de Tarifários e Calendário de Tarifação

## Decision 1: Intervalo semiaberto `[data_inicio, data_fim)` na API/Banco e datas efetivas inclusivas na UI

- **Decision**: Persistir e trafegar na API `data_inicio` (inclusiva) e `data_fim` (exclusiva) no formato ISO `YYYY-MM-DD`, enquanto na interface web o calendário e os campos de data exibem e editam o último dia efetivo de aplicação (`data_fim_efetiva = data_fim - 1 dia`).
- **Rationale**: Em sistemas hoteleiros (PMS), diárias correspondem a noites de hospedagem; o intervalo semiaberto `[data_inicio, data_fim)` permite que períodos consecutivos (`[2027-03-01, 2027-04-01)` e `[2027-04-01, 2027-05-01)`) sejam adjacentes sem sobreposição matemática no operador `&&` do PostgreSQL, enquanto o usuário hoteleiro visualiza intuitivamente o período efetivo de `01/03/2027` a `31/03/2027`.
- **Alternatives considered**: Armazenar intervalo fechado `[]` no banco e ajustar a constraint `daterange(..., '[]')`. Descartado porque a especificação (RN01/CA04) define explicitamente o intervalo semiaberto `[data_inicio, data_fim)` com `data_fim` exclusiva no modelo de dados e permite que um novo tarifário comece na mesma data `data_fim` do anterior.

## Decision 2: Constraint de exclusão PostgreSQL com `btree_gist` e `daterange`

- **Decision**: Habilitar a extensão `btree_gist` na migration do Prisma e adicionar a constraint `EXCLUDE USING gist ("hotel_id" WITH =, "categoria_quarto_id" WITH =, daterange("data_inicio", "data_fim", '[)') WITH &&) WHERE ("ativo" = true)` na tabela `tarifarios`.
- **Rationale**: Além da validação prévia no use case, a constraint de exclusão parcial no PostgreSQL impede condições de corrida (CA11) em transações concorrentes para o mesmo `hotel_id` e `categoria_quarto_id`, permitindo múltiplos registros inativos históricos no mesmo período. Violações PostgreSQL (`SQLSTATE 23P01`) são capturadas no repositório e convertidas em `TarifarioPeriodConflictError` (HTTP `409`).
- **Alternatives considered**: Validar sobreposição apenas em nível de aplicação (`SELECT` antes de `INSERT/UPDATE`). Descartado por ser vulnerável a condições de corrida sob requisições simultâneas e violar RF08/RN03/CA11.

## Decision 3: Precisão monetária com `NUMERIC(12,2)` e strings decimais no contrato

- **Decision**: Persistir `valor_diaria` como `Decimal @db.Decimal(12, 2)` no Prisma/PostgreSQL e trafegar `valor_diaria` como string decimal formatada (`"200.00"`) nos contratos HTTP (`@hotelmind/contracts` e schemas Zod), realizando cálculos de reserva em centavos inteiros ou `Prisma.Decimal`.
- **Rationale**: Evita erros de arredondamento de ponto flutuante IEEE 754 em cálculos de diárias (RN08) e mantém conformidade com o payload especificado no contrato (`"valor_diaria": "200.00"`).
- **Alternatives considered**: Trafegar `number` JSON em ponto flutuante. Descartado por risco de imprecisão decimal e divergência com o contrato da especificação.

## Decision 4: Adaptação estrita de nomenclatura para `snake_case`

- **Decision**: Adotar `snake_case` em todos os arquivos, pastas, rotas, schemas, repositórios, use cases e serviços (`tarifario_form.tsx`, `tarifario_calendar.tsx`, `criar_tarifario_use_case.ts`, `tarifario_pricing_service.ts`, etc.).
- **Rationale**: O `AGENTS.md` e o Princípio VI da Constituição do HotelMind determinam `snake_case` sem exceções, e a própria especificação orienta adaptar a estrutura sugerida aos padrões existentes no repositório.
- **Alternatives considered**: Usar `kebab-case` nos componentes frontend ou use cases. Descartado por violar a Constituição do repositório.

## Decision 5: Calendário mensal reutilizável construído sem dependências externas pesadas

- **Decision**: Construir o componente reutilizável `tarifario_calendar.tsx` (e subcomponentes `tarifario_calendar_day.tsx`, `tarifario_period_summary.tsx`, `tarifario_status_badge.tsx`) usando utilitários puros de data (`YYYY-MM-DD` sem desvio de fuso horário), Tailwind CSS, Lucide Icons e primitivos existentes do `shadcn/ui` (`Button`, `Badge`, `Card`, `Popover`).
- **Rationale**: O calendário de tarifação requer regras visuais e interativas específicas (seleção em 2 cliques com reinício se `fim < inicio`, exibição de períodos ocupados e conflitantes da categoria, indicadores visuais além de cor como bordas tracejadas/sólidas, ícones e badges, e inspeção de detalhes do tarifário existente por interação). Utilitários puros baseados em `YYYY-MM-DD` evitam bugs de fuso horário (UTC vs America/Sao_Paulo) comuns em `new Date("YYYY-MM-DD")`.
- **Alternatives considered**: Introduzir bibliotecas externas de datepicker genérico (`react-day-picker`), que adicionariam dependências extras e dificultariam a renderização customizada de faixas ocupadas/conflitantes com metadados de tarifários por dia.

## Decision 6: Regra do menor valor aplicável por noite no domínio (`TarifarioPricingService`)

- **Decision**: Implementar `TarifarioPricingService` e `CalcularTarifaReservaUseCase` no domínio da API, avaliando cada noite `d` do intervalo `[check_in, check_out)` individualmente contra os tarifários ativos elegíveis (`data_inicio <= d < data_fim`) do mesmo `hotel_id` e `categoria_quarto_id`, selecionando o menor `valor_diaria` para cada noite.
- **Rationale**: Atende RF11, RN06 e CA10 mantendo a lógica de precificação encapsulada no domínio do backend e preparada para evoluções futuras em que múltiplos tarifários ativos possam coexistir para uma mesma noite.
- **Alternatives considered**: Calcular tarifas no frontend ou aplicar uma única tarifa fixa do check-in para todas as noites da reserva. Descartado por violar RF11 e RN06.

## Decision 7: Isolamento Multi-Tenant via JWT (`request.user.hotelId`) e reutilização de componentes de listagem/formulário

- **Decision**: Obter `hotel_id` exclusivamente de `request.user.hotelId` em todas as rotas autenticadas de `/tarifarios`, ignorando qualquer `hotel_id` vindo do cliente, e reutilizar no frontend `ListPageLayout`, `PagedDataTable`, `CrudFormLayout`, `AlertDialog`, `Select` e `usePaginacao`.
- **Rationale**: Segue exatamente o padrão já consolidado em `quartos` e `categorias_quartos` (RF12, RN07, CA09), garantindo consistência visual e comportamental em todo o HotelMind.
