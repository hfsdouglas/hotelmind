# Phase 0 Research: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

## 1. Migração do Banco de Dados em Fases Seguras

- **Decision**: Dividir a introdução do regime de alimentação em 3 migrações sequenciais do Prisma:
  1. `20261103235854_create_regimes_alimentacao`: Criação da tabela `regimes_alimentacao` com colunas `id`, `hotel_id`, `nome`, `descricao`, `cor`, `ativo`, `created_at`, `updated_at`, índices e unique em `[hotel_id, nome]`.
  2. `20261104002423_add_regime_alimentacao_to_tarifarios`: Adição da coluna opcional `regime_alimentacao_id` em `tarifarios`, criação da chave estrangeira com `ON DELETE RESTRICT` e backfill populando tarifários legados com o regime padrão.
  3. `20261104005743_make_regime_alimentacao_mandatory`: Alteração da coluna `regime_alimentacao_id` para `NOT NULL`.
- **Rationale**:
  - Tentar adicionar uma coluna `NOT NULL` com foreign key em uma tabela que já possui linhas em produção causa erro de violação de constraint se não houver a etapa intermediária de preenchimento dos registros legados.
- **Alternatives considered**:
  - Valor padrão estático na migração: rejeitado porque cada hotel tem seus próprios IDs de regimes de alimentação.

## 2. Componente de Seleção Visual de Cores (`ColorPicker`)

- **Decision**: Criar `packages/web/src/components/ui/color_picker.tsx` oferecendo:
  - 8 botões circulares com cores recomendadas de alto contraste (azul `#3b82f6`, esmeralda `#10b981`, violeta `#8b5cf6`, âmbar `#f59e0b`, rosa `#ec4899`, céu `#0ea5e9`, laranja `#f97316`, ardósia `#64748b`).
  - Campo de entrada de texto manual validando formato hexadecimal (`#RRGGBB`).
  - Preview imediato do tom selecionado.
- **Rationale**:
  - Cores são vitais no contexto hoteleiro para identificação de pulseiras de hóspedes no buffet e destaque na listagem de tarifas.
  - A paleta predefinida agiliza a escolha, mantendo consistência visual, enquanto o campo hexadecimal oferece liberdade para cores de identidade visual do hotel.

## 3. Padronização do Botão de Salvar (`SaveButton`)

- **Decision**: Criar `SaveButton` em `packages/web/src/components/forms/save_button.tsx` e `packages/admin/src/components/forms/save_button.tsx` com:
  - Ícone de disquete `Save` de Lucide React.
  - Texto padrão "Salvar" ou customizado.
  - Estado `isLoading`: substitui o ícone por `Loader2` animado e o texto por "Salvando...", desabilitando o botão contra múltiplos cliques acidentais.
- **Rationale**:
  - Padroniza todos os formulários CRUD de ambas as aplicações, prevenindo duplicações de submissão em redes lentas.
