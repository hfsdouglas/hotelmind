# Architectural & Technical Research: Commercial Partners Management

**Feature**: `024-commercial-partners`  
**Date**: 2026-11-04  
**Context**: Implementação do módulo Comercial e do cadastro unificado de Parceiros Comerciais (Agentes Autônomos, Agências de Viagens, Operadoras de Turismo, Clubes de Férias e Empresas Corporativas) no HotelMind.

---

## 1. Pesquisa de Modelagem de Dados: Parceiro, Endereço, Contatos e Regras

### Problema
Como estruturar a persistência do parceiro comercial considerando que ele possui dados cadastrais (PF/PJ), endereço postal, identificadores regulatórios (CADASTUR, IATA, Embratur), múltiplos contatos (comercial e financeiro) e regras comerciais (modelo tarifário, comissão, política de faturamento, limite de crédito e allotment)?

### Decisão
Adotar um modelo semi-normalizado de alta coesão:
1. **Tabela Principal (`parceiros_comerciais`)**:
   - Identificação e classificação (`id`, `hotel_id`, `tipo_parceiro`, `tipo_pessoa`, `razao_social`, `nome_fantasia`, `documento`, `inscricao_estadual`, `estrangeiro`).
   - Registros regulatórios (`cadastur`, `codigo_iata`, `registro_embratur`).
   - Endereço postal incorporado diretamente (`logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`, `pais`).
   - Regras comerciais padrão incorporadas diretamente (`modelo_tarifario`, `comissao_padrao`, `politica_faturamento`, `prazo_pagamento_dias`, `limite_credito`, `allotment_quartos`).
   - Controle de ciclo de vida e auditoria (`status`, `observacoes`, `criado_em`, `atualizado_em`).
2. **Tabela Relacionada de Contatos (`parceiros_contatos`)**:
   - Relação 1:N com chave estrangeira `parceiro_id` com exclusão em cascata.
   - Atributos: `id`, `parceiro_id`, `tipo_contato` (`comercial` | `financeiro` | `operacional`), `nome`, `email`, `telefone`, `cargo`.

### Racional
- **Performance e Integridade**: Os dados de endereço e regras comerciais possuem cardinalidade estritamente 1:1 com o parceiro na versão v1. Incorporá-los na tabela principal simplifica consultas, elimina junções desnecessárias (*joins*) e permite inserções e atualizações transacionais atômicas.
- **Flexibilidade de Contatos**: A segregação de contatos em tabela própria (`parceiros_contatos`) permite que o hotel tenha mais de um contato comercial ou financeiro por parceiro, mantendo consultas indexadas por e-mail ou telefone.

### Alternativas Consideradas
- *Normalização total em 5 tabelas separadas (`parceiros`, `enderecos`, `regras_comerciais`, `contatos`, `registros`)*: Rejeitada por gerar complexidade desnecessária de ORM/Prisma e overhead de latência para atributos puramente 1:1.
- *Guardar contatos em coluna JSONB*: Rejeitada pois dificulta validação estrita de esquema no banco de dados e pesquisas rápidas por telefone ou e-mail de cobradores/agentes.

---

## 2. Pesquisa de Regras de Validação: Pessoa Física (CPF), Pessoa Jurídica (CNPJ) e Internacional

### Problema
O cadastro atende tanto agentes de viagens autônomos (Pessoas Físicas com CPF) quanto agências, operadoras e clubes (Pessoas Jurídicas com CNPJ), além de eventuais parceiros internacionais sem registro fiscal brasileiro.

### Decisão
Implementar validação contextual na camada de esquema (Zod) e entidade de domínio:
1. `tipo_pessoa`: Enum `'PF'` | `'PJ'`.
2. Quando `tipo_parceiro` for `agente_autonomo`: `tipo_pessoa` assume por padrão `'PF'`, tornando o campo `cpf` obrigatório com cálculo de dígitos verificadores (módulo 11).
3. Quando `tipo_parceiro` for `agencia_viagens`, `operadora_turismo`, `clube_turismo` ou `empresa_corporativa`: `tipo_pessoa` assume por padrão `'PJ'`, tornando o campo `cnpj` obrigatório com cálculo de dígitos verificadores.
4. Flag `estrangeiro` (booleano): Quando `true`, desativa a obrigatoriedade de CPF/CNPJ brasileiro, permitindo informar identificador fiscal internacional (`tax_id`) e código IATA.
5. Unicidade: Índice único composto em `@@unique([hotel_id, documento])` para documentos preenchidos, prevenindo duplicidade dentro do mesmo hotel.

### Racional
Evita inconsistências cadastrais clássicas (ex.: CNPJ digitado para pessoa física ou números fictícios) e mantém conformidade com a legislação tributária brasileira sem impedir parcerias internacionais.

### Alternativas Consideradas
- *Aceitar documento livre sem validação algorítmica*: Rejeitada para evitar corrupção da base de dados e problemas futuros na emissão de faturas/notas fiscais eletrônicas.

---

## 3. Pesquisa de Integração ao Menu, Rotas e RBAC do Sistema

### Problema
Onde e como o novo recurso deve ser exposto na arquitetura do HotelMind?

### Decisão
1. **Novo Módulo**: `Comercial`.
2. **Rotas Backend API**:
   - `POST /comercial/parceiros`: Criação de parceiro completo (com contatos).
   - `GET /comercial/parceiros`: Listagem paginada com busca textual e filtros (`tipo_parceiro`, `status`, `cidade`, `estado`).
   - `GET /comercial/parceiros/:id`: Recuperação detalhada com contatos vinculados.
   - `PUT /comercial/parceiros/:id`: Atualização cadastral e comercial.
   - `PATCH /comercial/parceiros/:id/status`: Alteração de status (`ativo`, `inativo`, `bloqueado`).
   - `DELETE /comercial/parceiros/:id`: Inativação lógica (ou exclusão se não houver histórico).
3. **Rotas Frontend Web**:
   - `/comercial/parceiros`: Listagem com filtros, status badges e ações rápidas.
   - `/comercial/parceiros/novo`: Formulário tabulado ou em blocos organizados (Identificação -> Endereço -> Regras Comerciais -> Contatos).
   - `/comercial/parceiros/:id/editar`: Edição com preservação dos dados.
4. **Seed de Permissões e Navegação**:
   - Adicionar em `packages/api/src/db/seeds/routes_seed.ts`:
     - Módulo: `'Comercial'`
     - Recurso: `'Parceiros'` (rota `/comercial/parceiros`) e `'Novo Parceiro'` (rota `/comercial/parceiros/novo`).
     - Ícone: `'Handshake'`.

### Racional
Segue o padrão estabelecido pelos módulos anteriores (`Reservas`, `Quartos`, `Tarifários`, `Usuários`), integrando-se dinamicamente ao menu de permissões e ao componente `Sidebar`.

---

## 4. Pesquisa de Nomenclatura e Tipagem Universal (`packages/.contracts`)

### Decisão
Seguir estritamente a convenção de `snake_case` nos arquivos e português para as entidades de negócio hoteleiro nacional:
- Arquivo de contrato: `packages/.contracts/src/parceiros_comerciais.ts`.
- Enums tipados:
  - `TipoParceiro`: `'agente_autonomo' | 'agencia_viagens' | 'operadora_turismo' | 'clube_turismo' | 'empresa_corporativa'`
  - `TipoPessoa`: `'PF' | 'PJ'`
  - `ModeloTarifario`: `'net' | 'comissionada' | 'acordo'`
  - `PoliticaFaturamento`: `'voucher' | 'faturado' | 'prepago'`
  - `StatusParceiro`: `'ativo' | 'inativo' | 'bloqueado'`
  - `TipoContatoParceiro`: `'comercial' | 'financeiro' | 'operacional'`
