# Quickstart & Validation Guide: Gestão de Parceiros Comerciais

**Feature**: `024-commercial-partners`  
**Date**: 2026-11-04  
**Context**: Roteiro de testes automatizados e validação manual do módulo Comercial e do cadastro unificado de Parceiros Comerciais no HotelMind.

---

## 1. Pré-requisitos

- Banco de dados PostgreSQL ativo com migrações aplicadas (`pnpm --filter api db:migrate`).
- Dependências instaladas (`pnpm install`).
- Seeds de rotas e permissões atualizados (`pnpm --filter api db:seed`).
- Referências:
  - [data-model.md](file:///home/douglas/www/hotelmind/specs/024-commercial-partners/data-model.md)
  - [commercial_partners.md](file:///home/douglas/www/hotelmind/specs/024-commercial-partners/contracts/commercial_partners.md)

---

## 2. Execução dos Testes Automatizados

```bash
# 1. Validação estática de tipagem e linting
pnpm biome check packages/.contracts packages/api packages/web
pnpm --filter .contracts build

# 2. Testes unitários dos casos de uso de Parceiros Comerciais na API
pnpm --filter api test run src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts

# 3. Testes de integração de rotas Fastify (/comercial/parceiros)
pnpm --filter api test run src/routes/comercial/parceiros_routes.spec.ts

# 4. Testes das páginas e componentes do módulo Comercial no Frontend
pnpm --filter web test run src/pages/app/comercial/parceiros/parceiros_pages.spec.tsx
```

---

## 3. Roteiro de Validação Manual

### 3.1. Acesso e Navegação no Módulo Comercial
1. Faça login na aplicação web administrativa como usuário hoteleiro.
2. Observe a barra lateral de navegação (`Sidebar`):
   - Deve existir o módulo **Comercial** com o ícone representativo (`Handshake`).
   - Sob **Comercial**, devem constar os recursos **Parceiros** (`/comercial/parceiros`) e **Novo Parceiro** (`/comercial/parceiros/novo`).

### 3.2. Cadastro de Agência de Viagens (PJ) com Validação de CNPJ e Endereço
1. Navegue até **Comercial** -> **Novo Parceiro**.
2. No campo **Tipo de Parceiro**, selecione `Agência de Viagens (Lazer / Corporativa / TMC)`.
3. Verifique que o campo de tipo de pessoa ajusta automaticamente para **Pessoa Jurídica (PJ)**.
4. Preencha os dados cadastrais:
   - Razão Social: `Viagens Horizonte Dourado Ltda`
   - Nome Fantasia: `Horizonte Viagens`
   - CNPJ: Informe um CNPJ válido com 14 dígitos.
   - CADASTUR: `19.012.345/0001-99`
   - Código IATA: `99-9 9999 0`
5. Preencha o endereço completo:
   - CEP: `01310-100`, Logradouro: `Avenida Paulista`, Número: `1000`, Complemento: `Conjunto 42`, Bairro: `Bela Vista`, Cidade: `São Paulo`, Estado: `SP`, País: `Brasil`.
6. Configure as Regras Comerciais:
   - Modelo Tarifário: `Comissionada`
   - Percentual de Comissão: `10%`
   - Política de Faturamento: `Faturado a prazo`
   - Prazo de Pagamento: `15` dias
   - Limite de Crédito: `R$ 50.000,00`
   - Allotment: `4` quartos
7. Adicione os Contatos:
   - Contato Comercial: Nome `Mariana Souza`, E-mail `comercial@horizonte.com.br`, Telefone `(11) 98765-4321`, Cargo `Gerente de Contas`.
   - Contato Financeiro: Nome `Roberto Silva`, E-mail `financeiro@horizonte.com.br`, Telefone `(11) 3251-0000`, Cargo `Analista de Cobrança`.
8. Clique em **Salvar Parceiro**:
   - O parceiro deve ser salvo e o usuário redirecionado para a listagem com mensagem de sucesso.

### 3.3. Cadastro de Agente Autônomo (PF com CPF)
1. Clique em **Novo Parceiro**.
2. Selecione o tipo `Agente Autônomo / Consultor (Pessoa Física)`.
3. Verifique que o formulário adapta os campos:
   - Exige CPF válido e Nome Completo.
   - Desativa campos estritamente corporativos (Razão Social / Inscrição Estadual).
4. Informe dados válidos com CPF e CADASTUR pessoal e salve o parceiro.

### 3.4. Cadastro de Clube de Turismo / Férias e Parceiro Internacional
1. Cadastre um parceiro como `Clube de Turismo / Férias` (ex: `Clube de Férias Aliança`, CNPJ válido, Política `Voucher`, Modelo `Tarifa Net`).
2. Cadastre uma operadora internacional marcando a opção **Parceiro Estrangeiro**:
   - Verifique que a máscara de CPF/CNPJ é desativada.
   - Permite preencher o identificador fiscal estrangeiro (Tax ID) e IATA internacional.

### 3.5. Busca, Filtros e Gestão de Status
1. Na tela de listagem (`/comercial/parceiros`):
   - Filtre por tipo `Clube de Turismo / Férias` e verifique que apenas os clubes são exibidos.
   - Digite o CNPJ ou Nome Fantasia no campo de busca e observe a filtragem instantânea.
2. Na listagem ou na tela de edição do parceiro:
   - Altere o status para **Bloqueado** e informe o motivo `Inadimplência de faturas de Outubro`.
   - Observe a exibição do badge vermelho de status `Bloqueado` com tooltip do motivo.
   - Teste a reativação para o status `Ativo`.
