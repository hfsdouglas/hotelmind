# Phase 0 Research: Tarifários Vinculados a Parceiros Comerciais

## 1. Relacionamento de Tarifário e Parceiro Comercial

### Contexto
Atualmente, o modelo `Tarifario` possui relações com `Hotel`, `CategoriaQuarto` e `RegimeAlimentacao`. O modelo `Reserva` já possui `parceiro_id`, mas `Orcamento` não possui referência a parceiro. O objetivo é permitir que tarifários pertençam a um parceiro comercial específico ou sejam tarifários públicos padrão.

### Decisão
1. Adicionar `parceiro_id String?` ao modelo `Tarifario` (com relação `@relation(fields: [parceiro_id], references: [id], onDelete: Cascade)` ou `SetNull` e índice `@@index([hotel_id, parceiro_id])`).
2. Adicionar `parceiro_id String?` ao modelo `Orcamento` (com relação `@relation(fields: [parceiro_id], references: [id], onDelete: SetNull)` e índice `@@index([hotel_id, parceiro_id])`).
3. Quando `parceiro_id` for `null`, o tarifário é considerado **público/balcão geral**.
4. Quando `parceiro_id` for preenchido com o UUID de um parceiro ativo do mesmo hotel, o tarifário é exclusivo daquele parceiro.

### Racional
- Mantém o princípio de menor surpresa: nullable foreign key permite reutilizar 100% da infraestrutura existente de tarifários sem precisar criar uma tabela separada.
- Adicionar `parceiro_id` ao `Orcamento` unifica o comportamento entre Orçamentos e Reservas, viabilizando conversão direta de orçamentos de parceiros em reservas com exatidão tarifária.

### Alternativas Consideradas
- **Tabela N:N de associação `TarifarioParceiro`**: Permitiria que um único tarifário fosse compartilhado por 3 parceiros diferentes. Porém, na hotelaria corporativa e operadoras, cada contrato tem sua tabela negociada com margens específicas; além disso, o requisito expressa "tarifários vinculados à um parceiro comercial". Uma tabela N:N adicionaria complexidade de junções desnecessária neste momento. Se no futuro houver necessidade de clonagem de tarifas para múltiplos parceiros, pode-se clonar os registros ou estender a relação.
- **Campos de desconto percentual estático no parceiro comercial**: O parceiro já tem `comissao_padrao` e `modelo_tarifario`, mas o requisito exige vincular *tarifários diários com calendários específicos* ao parceiro, permitindo tarifas flutuantes e sazonalidades contratuais.

---

## 2. Regra de Conflito e Sobreposição de Datas em Tarifários

### Contexto
O sistema valida sobreposição de períodos ativos (`find_overlapping_active`). Se dois tarifários fossem cadastrados para as mesmas datas e mesma categoria, haveria conflito. Com a introdução de tarifas por parceiro, como tratar a sobreposição?

### Decisão
A sobreposição de datas (`find_overlapping_active`) deve considerar o escopo do parceiro:
- Tarifários públicos (`parceiro_id == null`) não podem conflitar entre si para a mesma categoria e mesmo regime de alimentação.
- Tarifários do Parceiro A (`parceiro_id == A`) não podem conflitar com outros tarifários do Parceiro A para a mesma categoria e mesmo regime de alimentação.
- No entanto, o Parceiro A **pode** ter tarifário ativo nas mesmas datas em que existe um tarifário público ou um tarifário do Parceiro B.

### Racional
Garante que o hotel possa ter uma tarifa balcão de R$ 500,00 e simultaneamente uma tarifa CVC (Parceiro A) de R$ 380,00 e uma tarifa Booking (Parceiro B) de R$ 450,00 para o mesmo quarto e mesmo período sem falso conflito.

---

## 3. Filtragem de Suítes e Tarifas em Orçamentos e Reservas

### Contexto
Requisito: *"Ou seja, para criar uma reserva/orçamento onde o parceiro comercial é indicado, deve ser apresentada apenas as tarifas e suítes disponíveis para ele."*

### Decisão
1. **Em Orçamentos (`novo.tsx` e backend `CriarOrcamentoUseCase`)**:
   - Se `parceiro_id` estiver preenchido:
     - O backend busca apenas tarifários ativos com `parceiro_id == input.parceiro_id`.
     - O frontend exibe apenas as categorias de quartos (suítes) que possuem cobertura tarifária completa para o período solicitado através das tarifas desse parceiro.
     - As categorias sem tarifa cadastrada para o parceiro são desabilitadas ou ocultadas da seleção.
   - Se `parceiro_id` não for informado (ou vazio):
     - O backend e frontend consideram apenas tarifários públicos (`parceiro_id == null`).
2. **Em Reservas (`nova.tsx`, `consultar_disponibilidade_use_case` e `CriarReservaUseCase`)**:
   - `ConsultarDisponibilidadeUseCase` recebe `parceiro_id?: string | null`.
   - Ao calcular a tarifa das suítes vagas, utiliza apenas tarifários ativos do parceiro especificado (ou públicos se nulo).
   - Se uma suíte física pertence a uma categoria que não tem tarifa para o parceiro no período, ela não é elegível e não retorna na lista de quartos disponíveis.
   - O `CriarReservaUseCase` valida se a categoria da suíte possui tarifário ativo correspondente ao parceiro (ou público se sem parceiro) antes de gerar a reserva.

### Racional
A regra garante que nenhum operador venda inadvertidamente uma suíte para um parceiro com preço de balcão (ou sem contrato), e que o cliente direto não tenha acesso a tarifas exclusivas de parceiros.

---

## 4. Arquitetura Modular de Seeds

### Contexto
Requisito: *"Para testes, crie pelo menos 5 parceiros comerciais via seed. É importante que os seeds sejam separados por contexto/pasta. O seed de rotas é um seed utilizado em produção."*

### Decisão
Reorganizar `packages/api/src/db/seeds/` em módulos orientados a contexto:
```text
packages/api/src/db/seeds/
├── producao/                   # Seeds elegíveis para execução em ambiente de produção
│   └── rotas_seed.ts           # Cadastro idempotente de rotas de sistema e permissões
├── desenvolvimento/            # Massa de teste e desenvolvimento
│   ├── hotel_seed.ts           # Hotel fictício e grupos base
│   ├── acomodacoes_seed.ts     # Categorias de quarto, quartos e camas
│   ├── regimes_seed.ts         # Regimes de alimentação
│   ├── parceiros_seed.ts       # Pelo menos 5 parceiros comerciais com contatos e endereços
│   └── tarifarios_seed.ts      # Tarifários públicos e tarifários vinculados aos parceiros
├── routes_seed.ts              # Proxy/re-export apontando para producao/rotas_seed.ts (retrocompatibilidade)
└── index.ts                    # Orquestrador geral de seed para desenvolvimento/testes
```

### Script de Execução e Idempotência:
- `pnpm --filter api db:seed:routes`: executa estritamente `rotas_seed.ts` (produção).
- `pnpm --filter api db:seed`: executa a cadeia completa de desenvolvimento (hotel -> acomodações -> regimes -> parceiros -> tarifários -> rotas).
- Pelo menos 5 parceiros comerciais representativos serão semeados:
  1. *CVC Viagens e Operadora* (Operadora de Turismo, modelo comissionada 12%, pré-pago)
  2. *Booking.com Corporate* (OTA Internacional, modelo líquida/comissionada 15%, limite crédito alto)
  3. *Decolar.com Viagens* (Agência Online, modelo faturada 30 dias)
  4. *Petrobras Corporativo* (Empresa Corporativa, faturada 15 dias, tarifas executivas fixas)
  5. *Vale S.A. Operações* (Empresa Corporativa, faturada 28 dias com allotment dedicado)

### Racional
- Mantém o seed de produção 100% isolado de dados de teste/mock.
- Organiza por contexto de domínio, tornando fácil encontrar, manter e testar cada conjunto de sementes separadamente.
