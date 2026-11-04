# Feature Specification: Commercial Partners Management (Gestão de Parceiros Comerciais)

**Feature Branch**: `024-commercial-partners`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Crie um módulo Comercial com um recurso para cadastro de Parceiros. O cadastro deve ser estruturado dessa forma: [Cadastro de Parceiros Comerciais] ├── Tipo de Parceiro: Agente Autônomo / Consultor (Pessoa Física), Agência de Viagens (Lazer / Corporativa / TMC), Operadora de Turismo (Wholesaler / Receptivo), Clube de Turismo / Férias (ex: Bancorbrás, RDC, Candeias), Empresa Corporativa (Opcional, para faturamento direto); ├── Dados Cadastrais: Documento (CPF ou CNPJ), Registro no Órgão Regulador (ex: CADASTUR, IATA, Embratur), Contato comercial e financeiro; └── Regras Comerciais: Modelo Tarifário (Tarifa Net, Comissionada, Acordo/Negociada), Percentual de Comissão, Política de Faturamento (Voucher, Faturado a prazo, Pré-pago), Limite de Crédito / Allotment (bloqueio de quartos). Adicionar campos de endereço."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro de Novo Parceiro Comercial com Classificação e Endereço (Priority: P1)

Como gerente comercial ou atendente de reservas do hotel, desejo cadastrar um novo parceiro comercial com sua respectiva classificação de negócio, dados cadastrais, endereço completo e dados de identificação formal, para que o hotel mantenha uma base centralizada e auditável de seus canais B2B.

**Why this priority**: É a fundação do módulo comercial. Sem o cadastro estruturado da entidade parceira, nenhum vínculo de reservas, tarifários ou faturamento posterior é possível.

**Independent Test**: Pode ser testado de ponta a ponta criando um parceiro de cada um dos 5 tipos (Agente Autônomo, Agência, Operadora, Clube de Turismo, Empresa Corporativa), informando seus dados cadastrais, endereço e salvando com sucesso.

**Acceptance Scenarios**:

1. **Given** que o usuário está no módulo Comercial na seção de Parceiros, **When** clica em "Novo Parceiro", seleciona "Agência de Viagens", informa Razão Social, Nome Fantasia, CNPJ válido e endereço completo (Logradouro, Número, Bairro, Cidade, Estado, CEP), **Then** o sistema grava o registro e exibe a agência como ativa no catálogo de parceiros.
2. **Given** que o usuário está cadastrando um "Agente Autônomo / Consultor", **When** seleciona este tipo, **Then** o sistema ajusta os campos cadastrais para Pessoa Física (solicitando Nome Completo e CPF obrigatório com validação de dígitos).
3. **Given** que o usuário tenta cadastrar um parceiro com CPF ou CNPJ já existente na base do hotel, **When** confirma a criação, **Then** o sistema bloqueia o cadastro e emite alerta amigável de duplicidade informando o registro já existente.

---

### User Story 2 - Definição de Regras Comerciais, Políticas de Faturamento e Comissões (Priority: P1)

Como gestor comercial ou gerente financeiro, desejo configurar as regras comerciais de cada parceiro (modelo tarifário, taxa de comissão, política de faturamento, limite de crédito e cota de allotment), para que as reservas e cobranças geradas por este parceiro sigam rigorosamente os acordos contratuais firmados.

**Why this priority**: A parametrização comercial é o que diferencia os canais indiretos (B2B) da venda direta ao hóspede, viabilizando o cálculo correto de comissões e prazos de faturamento.

**Independent Test**: Pode ser testado editando as regras comerciais de um parceiro recém-criado, definindo modelo tarifário comissionado a 10%, política de faturamento a prazo com limite de R$ 50.000,00 e allotment de 5 quartos, verificando a persistência correta dos parâmetros.

**Acceptance Scenarios**:

1. **Given** um parceiro cadastrado como "Operadora de Turismo", **When** o usuário define o Modelo Tarifário como "Tarifa Net", Política de Faturamento como "Faturado a prazo" com prazo de 15 dias e Limite de Crédito de R$ 100.000,00, **Then** os parâmetros comerciais são salvos e ficam disponíveis para aplicação nas reservas.
2. **Given** um parceiro configurado com Modelo Tarifário "Comissionada", **When** o usuário informa o Percentual de Comissão de 12%, **Then** o sistema valida o intervalo permitido (0% a 100%) e armazena a alíquota padrão deste canal.
3. **Given** um parceiro configurado com Política de Faturamento "Pré-pago", **When** o usuário tenta registrar um Limite de Crédito em aberto sem exigência de pré-pagamento, **Then** o sistema esclarece a política contratual selecionada mantendo a consistência dos termos acordados.

---

### User Story 3 - Registro de Órgãos Reguladores e Credenciamento Turístico (Priority: P2)

Como responsável de conformidade ou comercial hoteleiro, desejo registrar números de credenciamento do parceiro em órgãos reguladores do turismo (CADASTUR, IATA e Embratur), para assegurar que o hotel só remunere e opere com agentes e operadoras devidamente regularizados.

**Why this priority**: Garante segurança jurídica, atende normas do setor de turismo nacional e internacional (IATA para consolidadoras e CADASTUR para agências/guias/operadoras brasileiras).

**Independent Test**: Pode ser testado preenchendo números válidos de CADASTUR e IATA em um cadastro de Agência de Viagens e confirmando que esses dados são preservados, exibidos e pesquisáveis.

**Acceptance Scenarios**:

1. **Given** o formulário de cadastro de uma agência de viagens, **When** o usuário informa o número CADASTUR e código numérico IATA da agência, **Then** o sistema grava os dados regulatórios e os destaca na ficha cadastral do parceiro.
2. **Given** um parceiro do tipo "Clube de Turismo / Férias", **When** o usuário cadastra seus registros oficiais (ex: CADASTUR ou Embratur institucional), **Then** os dados ficam arquivados para fins de auditoria de convênios.

---

### User Story 4 - Gestão Distinta de Contatos Comerciais e Financeiros (Priority: P2)

Como operador de reservas ou assistente de cobrança, desejo registrar contatos específicos para a área comercial (responsável por negociações e reservas) e para a área financeira (responsável por vouchers, notas fiscais e faturas), para que a comunicação do hotel chegue à pessoa certa sem ruído operacional.

**Why this priority**: Reduz inadimplência, acelera conciliação de vouchers e previne envio de informações financeiras sensíveis para atendentes de balcão de agências.

**Independent Test**: Pode ser testado adicionando um contato comercial (nome, e-mail, telefone) e um contato financeiro (nome, e-mail, telefone) no mesmo parceiro, validando que ambos são listados em seções claras e diferenciadas.

**Acceptance Scenarios**:

1. **Given** um parceiro em edição, **When** o usuário adiciona os dados do Contato Comercial (Nome: "Ana Silva", E-mail: "vendas@operadora.com", Telefone: "(11) 98888-1111") e do Contato Financeiro (Nome: "Carlos Souza", E-mail: "cobranca@operadora.com", Telefone: "(11) 3222-0000"), **Then** o sistema vincula ambos ao perfil do parceiro indicando explicitamente suas finalidades.
2. **Given** a necessidade de atualização, **When** o contato financeiro de um parceiro muda, **Then** o usuário pode editar exclusivamente o contato financeiro sem alterar as condições comerciais ou endereço da entidade.

---

### User Story 5 - Consulta, Filtros, Busca e Gestão de Status dos Parceiros (Priority: P3)

Como gestor do hotel, desejo visualizar a lista unificada de todos os parceiros comerciais com opções de busca e filtros por Tipo de Parceiro e Status (Ativo, Inativo, Bloqueado), para gerenciar a carteira e restringir parceiros inadimplentes.

**Why this priority**: Facilita a localização rápida de parceiros durante a emissão de cotações/reservas e permite suspender temporariamente parceiros que ultrapassaram o limite de crédito ou estão em inadimplência.

**Independent Test**: Pode ser testado filtrando a listagem apenas por "Clubes de Turismo / Férias", realizando busca textual por Nome Fantasia ou CNPJ, e alternando o status de um parceiro de "Ativo" para "Bloqueado".

**Acceptance Scenarios**:

1. **Given** uma lista com dezenas de parceiros cadastrados, **When** o usuário filtra por "Tipo: Clube de Turismo / Férias", **Then** a listagem exibe exclusivamente os clubes conveniados cadastrados.
2. **Given** um parceiro com pendências financeiras, **When** o gerente comercial altera seu status para "Bloqueado" e informa o motivo da restrição, **Then** o sistema marca o parceiro como bloqueado e exibe um distintivo visual de alerta na listagem e na ficha detalhada.

---

### Edge Cases

- **Parceiro Internacional:** Como o sistema trata uma agência ou operadora sediada no exterior que não possui CPF ou CNPJ? O sistema deve permitir sinalizar "Parceiro Estrangeiro", tornando o campo CNPJ/CPF opcional e exigindo identificador fiscal do país de origem (Tax ID) ou código IATA.
- **Mudança de Tipo de Parceiro:** Se um usuário cadastrou inicialmente uma entidade como "Agente Autônomo" (Pessoa Física com CPF) e depois tenta alterar para "Agência de Viagens" (PJ com CNPJ), o sistema deve orientar o usuário sobre os campos incompatíveis e exigir a documentação fiscal adequada antes de concluir a alteração.
- **Percentual de Comissão Inválido:** Tentativa de informar comissões negativas ou superiores a 100% deve ser barrada imediatamente com mensagem de validação explicativa.
- **Limite de Crédito Zero ou Negativo:** Caso o limite de crédito seja R$ 0,00 para um parceiro com política "Faturado a prazo", o sistema deve alertar que qualquer faturamento estará condicionado à liberação gerencial prévia.
- **Exclusão de Parceiro com Histórico:** Parceiros que já possuem histórico de reservas ou faturamentos no hotel não podem ser excluídos permanentemente; o sistema deve permitir apenas a inativação ou bloqueio para preservar a integridade histórica e contábil.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um módulo Comercial com recurso dedicado para a Gestão de Parceiros Comerciais.
- **FR-002**: O sistema DEVE permitir classificar o parceiro comercial obrigatoriamente em um dos seguintes tipos:
  - *Agente Autônomo / Consultor (Pessoa Física)*
  - *Agência de Viagens (Lazer / Corporativa / TMC)*
  - *Operadora de Turismo (Wholesaler / Receptivo)*
  - *Clube de Turismo / Férias (ex: Bancorbrás, RDC, Candeias)*
  - *Empresa Corporativa (para faturamento direto)*
- **FR-003**: O sistema DEVE distinguir o tipo de pessoa do parceiro entre *Pessoa Física (PF)* e *Pessoa Jurídica (PJ)*:
  - Para Pessoa Física: exigir Nome Completo e CPF com validação de formato e dígito verificador.
  - Para Pessoa Jurídica: exigir Razão Social, Nome Fantasia e CNPJ com validação de formato e dígito verificador.
- **FR-004**: O sistema DEVE garantir a unicidade de documento fiscal (CPF ou CNPJ) por hotel ou organização, impedindo cadastros duplicados acidentais.
- **FR-005**: O sistema DEVE suportar parceiros internacionais, permitindo selecionar o país de origem e informar o Tax ID / identificador fiscal estrangeiro na ausência de CPF/CNPJ brasileiro.
- **FR-006**: O sistema DEVE registrar informações completas de endereço para o parceiro, incluindo:
  - Logradouro / Rua / Avenida
  - Número
  - Complemento (opcional)
  - Bairro
  - Cidade
  - Estado / Unidade Federativa (UF)
  - CEP / Código Postal
  - País (com padrão "Brasil")
- **FR-007**: O sistema DEVE permitir registrar identificadores em órgãos reguladores do turismo:
  - Número de registro no CADASTUR
  - Código IATA / IATAN
  - Código Embratur ou outros registros regulamentares aplicáveis
- **FR-008**: O sistema DEVE permitir o cadastro de múltiplos contatos estruturados, segregados minimamente em:
  - *Contato Comercial*: Nome, e-mail, telefone/celular e cargo/função.
  - *Contato Financeiro*: Nome, e-mail, telefone/celular e cargo/função.
- **FR-009**: O sistema DEVE suportar a configuração do Modelo Tarifário padrão do parceiro entre:
  - *Tarifa Net (Líquida)*: hotel fatura o valor líquido acordado e o parceiro aplica sua margem de revenda (*markup*).
  - *Comissionada*: hotel vende pelo valor da tarifa pública ou negociada e paga comissão percentual ao parceiro.
  - *Acordo / Negociada*: tarifa fixa ou com desconto específico acordado contratualmente.
- **FR-010**: O sistema DEVE permitir definir um percentual de comissão padrão para o parceiro (aceitando valores de 0,00% a 100,00%).
- **FR-011**: O sistema DEVE permitir definir a Política de Faturamento padrão entre:
  - *Voucher*: reserva confirmada mediante apresentação e faturamento do voucher da agência/operadora/clube.
  - *Faturado a prazo*: faturamento com emissão de nota e boleto para liquidação futura em prazo determinado.
  - *Pré-pago*: pagamento integral antecipado antes da entrada do hóspede (check-in).
- **FR-012**: O sistema DEVE permitir estipular as condições de prazo de pagamento (ex.: número de dias após o check-out ou após a emissão da fatura) para parceiros com política faturada.
- **FR-013**: O sistema DEVE permitir estipular um Limite de Crédito em moeda corrente para controle de saldo devedor em aberto em reservas faturadas.
- **FR-014**: O sistema DEVE permitir estipular uma cota de Allotment (quantidade de apartamentos/quartos bloqueados em garantia contratual para o parceiro).
- **FR-015**: O sistema DEVE gerenciar o ciclo de vida do parceiro através de status:
  - *Ativo*: apto a intermediar novas reservas e negociar tarifas.
  - *Inativo*: temporariamente fora de operação, sem bloqueio restritivo.
  - *Bloqueado*: suspenso por pendências comerciais/financeiras, impedindo novas reservas faturadas.
- **FR-016**: O sistema DEVE permitir listar todos os parceiros cadastrados, com paginação e ordenação por nome, tipo, documento ou data de cadastro.
- **FR-017**: O sistema DEVE disponibilizar filtros por Tipo de Parceiro, Status (Ativo, Inativo, Bloqueado), Cidade/Estado e busca textual dinâmica (por Nome, Razão Social, Nome Fantasia, CPF/CNPJ ou CADASTUR).
- **FR-018**: O sistema DEVE impedir a exclusão física de parceiros que possuam vínculos históricos com reservas, cotações ou lançamentos financeiros, oferecendo a opção de inativação.
- **FR-019**: O sistema DEVE registrar data de criação, data da última atualização e o usuário responsável pelas alterações no cadastro do parceiro (trilha de auditoria).
- **FR-020**: O sistema DEVE permitir a inclusão de observações comerciais e restrições operacionais em campo de texto livre no perfil do parceiro.

---

### Key Entities *(include if feature involves data)*

- **Parceiro Comercial (`CommercialPartner`)**:
  - Entidade central que representa a agência, operadora, consultor, clube ou corporação.
  - Atributos principais: Identificador único, tipo de parceiro, tipo de pessoa (PF/PJ), nome/razão social, nome fantasia, documento fiscal (CPF/CNPJ/Tax ID), país de origem, status, data de início da parceria, observações gerais.
- **Endereço do Parceiro (`PartnerAddress`)**:
  - Dados de localização postal da sede ou domicílio do parceiro.
  - Atributos: Logradouro, número, complemento, bairro, cidade, estado/UF, CEP, país.
- **Contatos do Parceiro (`PartnerContact`)**:
  - Pessoas de contato vinculadas ao parceiro, diferenciadas por área de atuação.
  - Atributos: Identificador único, parceiro vinculado, finalidade/área (Comercial, Financeiro, Operações), nome completo, e-mail de contato, telefone comercial, celular/WhatsApp, cargo.
- **Registros Regulatórios (`RegulatoryRecord`)**:
  - Números de identificação em entidades e órgãos regulamentadores de turismo.
  - Atributos: Tipo de órgão (CADASTUR, IATA, Embratur, etc.), número de inscrição/licença, data de validade (quando aplicável).
- **Regras Comerciais do Parceiro (`CommercialAgreement`)**:
  - Parâmetros contratuais que guiam a precificação e a liquidação das reservas geradas pelo parceiro.
  - Atributos: Modelo tarifário (Net, Comissionada, Acordo), percentual de comissão padrão, política de faturamento (Voucher, Faturado a prazo, Pré-pago), prazo de pagamento em dias, limite de crédito concedido, cota de allotment contratual.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue completar o cadastro de um novo parceiro comercial com dados cadastrais, endereço completo e regras comerciais em menos de 3 minutos.
- **SC-002**: 100% dos parceiros cadastrados são categorizados corretamente entre os 5 tipos suportados, sem ambiguidades cadastrais.
- **SC-003**: 100% das tentativas de cadastro com CPFs ou CNPJs matematicamente inválidos ou duplicados são rejeitadas pelo sistema com mensagem de erro clara.
- **SC-004**: Os filtros por tipo de parceiro e a busca textual retornam os resultados correspondentes em menos de 1 segundo para bases com até 5.000 parceiros.
- **SC-005**: 95% dos usuários realizam o cadastro de parceiros comerciais no primeiro uso sem necessidade de suporte ou treinamento adicional.
- **SC-006**: 100% das alterações de dados cadastrais e regras comerciais mantêm registro auditável de data, hora e responsável pela alteração.

---

## Assumptions

- O cadastro de Parceiros Comerciais é mantido em nível de hotel/propriedade ou compartilhado na rede hoteleira, aplicando-se às reservas geradas em todos os pontos de atendimento da propriedade.
- Em uma primeira versão, cada parceiro possui um conjunto padrão ativo de regras comerciais (modelo tarifário, comissão e faturamento), sendo que eventuais exceções por período ou pacote poderão ser refinadas no módulo de Tarifários/Rate Plans.
- Para parceiros nacionais, a validação de formato e algoritmo de CPF e CNPJ é mandatória. Para parceiros sediados no exterior, a validação de CPF/CNPJ é desativada mediante seleção explícita de "Parceiro Estrangeiro", utilizando-se o identificador fiscal internacional (Tax ID/VAT/EIN).
- A política de faturamento "Voucher" segue o fluxo de conferência de documento físico ou eletrônico emitido pelo parceiro no momento do check-in para posterior faturamento agrupado.
- Os dados de endereço adotam a estrutura padrão dos Correios para o Brasil (com CEP, UF e Município), mas são flexíveis para acomodar nomenclaturas de províncias e códigos postais de parceiros internacionais.
