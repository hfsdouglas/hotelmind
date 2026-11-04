# Quickstart & Validation Guide: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

## 1. Pré-requisitos

- Banco de dados PostgreSQL ativo com migrações aplicadas (`pnpm --filter api db:migrate`).
- Dependências instaladas (`pnpm install`).
- Ao menos um Regime de Alimentação ativo cadastrado (ex.: Café da Manhã) e uma Categoria de Quarto com Tarifários vigentes.

## 2. Execução dos Testes Automatizados

```bash
# Testes de Casos de Uso de Leads na API
pnpm --filter api test run src/core/usecases/leads/leads_use_cases.spec.ts

# Testes de Casos de Uso de Orçamentos na API (criação, cálculo, token público)
pnpm --filter api test run src/core/usecases/orcamentos/orcamentos_use_cases.spec.ts

# Testes de Rotas HTTP de Leads e Orçamentos na API (incluindo endpoint público sem auth)
pnpm --filter api test run src/routes/leads/leads_routes.spec.ts src/routes/orcamentos/orcamentos_routes.spec.ts

# Testes das Páginas de Orçamentos no Frontend (Listagem, Criação Sequencial, Edição com botões fictícios)
pnpm --filter web test run src/pages/app/reservas/orcamentos/orcamentos_pages.spec.tsx

# Testes da Página Pública Mobile-First de Visualização do Orçamento
pnpm --filter web test run src/pages/public/orcamento/orcamento_publico_page.spec.tsx
```

## 3. Roteiro de Validação Manual

### 3.1. Criação de Orçamento com Período Inicial, Regime e Vínculo de Lead
1. Acesse o sistema e navegue no menu lateral até **Reservas** -> **Orçamentos** (`/reservas/orcamentos`).
2. Clique no botão **Novo Orçamento** (`/reservas/orcamentos/novo`).
3. **Passo 1 (Período e Ocupação)**: Selecione as datas de check-in e check-out, informe 2 adultos, 1 criança e marque 1 pet opcional.
4. **Passo 2 (Regime de Alimentação e Suítes)**: Selecione o regime de alimentação desejado (ex.: "Café da Manhã"). Observe que o sistema carrega as suítes/categorias que contam com tarifários cadastrados para aquele período e regime.
5. **Passo 3 (Seleção de Suíte e Lead)**: Selecione a categoria de quarto desejada dentre as opções carregadas. Em seguida, preencha os dados do primeiro contato: Nome ("Lucas Oliveira"), WhatsApp ("11988887777") e E-mail ("lucas@teste.com").
6. Clique em **Salvar Orçamento**:
   - O sistema deve persistir o lead e o orçamento com sucesso.
   - Mesmo que a categoria de quarto esteja sem quartos físicos livres naquelas datas, a cotação deve ser gerada normalmente sem bloquear por indisponibilidade.
   - Você será redirecionado para a tela de visualização/edição do orçamento criado.

### 3.2. Ações Fictícias e Compartilhamento
1. Na tela do orçamento recém-criado, clique em **Copiar link**:
   - Uma notificação (toast) de sucesso deve aparecer confirmando que o link público foi copiado para a área de transferência.
2. Clique no botão fictício **Enviar por E-mail**:
   - Um toast/diálogo de confirmação deve informar que a proposta foi simulada para envio ao e-mail do lead.
3. Clique no botão fictício **Enviar WhatsApp**:
   - Um toast informativo deve indicar o envio simulado via WhatsApp.

### 3.3. Visualização Pública Mobile-First do Lead
1. Abra uma nova aba anônima no navegador (ou ative o modo de inspeção responsivo de dispositivo móvel no DevTools).
2. Cole e acesse o link copiado (formato: `http://localhost:5173/orcamento/{token}`).
3. Verifique que a página abre sem exigir login:
   - Cabeçalho exibe o nome e contato do hotel.
   - Cartão mobile-first apresenta as datas de estada, total de noites e hóspedes (incluindo o pet).
   - O regime de alimentação é exibido com sua cor de destaque e descrição.
   - O valor total calculado é destacado com clareza.
4. Clique no botão **Reservar**:
   - Deve ser exibida uma mensagem amigável esclarecendo que a reserva online direta estará disponível em breve e fornecendo canais de contato com a recepção.

### 3.4. Edição e Exclusão de Orçamento
1. De volta ao painel administrativo, altere a quantidade de adultos ou observações e clique em **Salvar**.
2. Atualize a página pública do lead e observe que os dados refletem a alteração imediatamente.
3. Na listagem de orçamentos, exclua o orçamento criado e confirme no diálogo:
   - O registro é removido da listagem.
   - Ao recarregar a URL pública do orçamento, a mensagem "Orçamento não encontrado ou expirado" deve ser exibida.
