# Feature Specification: Configurações do Hotel (Aplicação Web)

**Feature Branch**: `028-hotel-settings`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Criar a página de configurações do hotel na aplicação web, localizada na rota Configurações > Hotel. Permitir a gestão completa da identidade visual/tema, regras de gratuidade de crianças, horários operacionais de check-in/out e recepção, regras de convivência (pets e fumo) e configurações de serviços (estacionamento e Wi-Fi). Removidos parâmetros não utilizados de cobrança/berços de crianças, flexibilidade de horários, regras detalhadas de pets, horários de silêncio e instruções adicionais de estacionamento/Wi-Fi."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidade Visual, Branding e Dados Institucionais com Preview (Priority: P1)

Como administrador ou gerente do hotel, quero configurar a identidade visual (logotipos, favicon e paleta de cores) e os dados institucionais do hotel, visualizando em tempo real a aplicação do tema em um card de demonstração, para garantir a consistência da marca no sistema, vouchers e motor de reservas.

**Why this priority**: A identidade visual e os dados institucionais constituem o cartão de visitas e o alicerce visual de todas as interfaces e documentos gerados pelo hotel (vouchers, confirmações e motor de reservas).

**Independent Test**: Pode ser testado de forma independente acessando a aba "Identidade Visual & Tema", atualizando os dados institucionais, enviando imagens de logomarca/ícone, ajustando a paleta de cores no seletor visual e verificando se o preview reflete instantaneamente as novas cores e se a gravação persiste os dados com sucesso.

**Acceptance Scenarios**:

1. **Given** que o gestor está na aba "Identidade Visual & Tema", **When** ele altera as cores primária, secundária, de fundo, cartões, textos e destaques através do seletor visual ou código hexadecimal, **Then** o card de demonstração (preview em tempo real) atualiza imediatamente suas cores de fundo, botões, textos e destaques refletindo a nova combinação visual.
2. **Given** o formulário de dados institucionais, **When** o usuário preenche o nome fantasia obrigatório, razão social, CNPJ formatado, categoria do estabelecimento, classificação por estrelas, descrição resumida (até 160 caracteres) e descrição completa, **Then** as informações são validadas e mantidas em estado pronto para persistência.
3. **Given** a seleção de arquivos para logotipo principal, logotipo para fundos escuros ou favicon, **When** o usuário seleciona arquivos de imagem válidos (PNG, SVG ou ICO), **Then** o sistema exibe miniaturas de pré-visualização dos arquivos carregados.

---

### User Story 2 - Políticas de Gratuidade de Crianças (Priority: P1)

Como gerente hoteleiro ou operador de reservas, quero definir a idade máxima para gratuidade de crianças e o limite de crianças gratuitas por quarto, para automatizar o cálculo de cortesia de menores nas reservas.

**Why this priority**: É essencial para garantir transparência nas regras de cortesia para famílias sem complexidades tarifárias excedentes nesta tela.

**Independent Test**: Acessar a aba "Crianças & Hóspedes Extras", configurar a idade limite de gratuidade e o número máximo de crianças gratuitas por acomodação, salvando e validando os valores persistidos.

**Acceptance Scenarios**:

1. **Given** a aba "Crianças & Hóspedes Extras", **When** o gestor preenche a idade máxima de gratuidade (ex.: até 5 anos) e a quantidade máxima de crianças gratuitas por acomodação (ex.: 1 criança), **Then** esses limites ficam definidos e validados como números inteiros não negativos.

---

### User Story 3 - Horários Operacionais de Check-in, Check-out e Recepção (Priority: P2)

Como administrador do hotel, quero parametrizar os horários padrão de check-in e check-out, bem como o regime de funcionamento da recepção (24 horas ou horário comercial delimitado).

**Why this priority**: Garante que os hóspedes e a equipe tenham clareza operacional sobre prazos de entrada, saída e disponibilidade do atendimento da recepção.

**Independent Test**: Acessar a aba "Horários & Operação", definir horários padrão de check-in e check-out, alternar o funcionamento da recepção entre 24h e horários específicos de abertura/fechamento, e verificar a obrigatoriedade dos horários quando não for 24h.

**Acceptance Scenarios**:

1. **Given** a aba "Horários & Operação", **When** o usuário define os horários padrão de check-in (ex.: 14:00) e check-out (ex.: 12:00), **Then** os horários são validados no formato de hora válido.
2. **Given** o bloco de funcionamento da recepção, **When** o usuário desativa o toggle de recepção 24 horas, **Then** os horários de abertura e fechamento da recepção tornam-se de preenchimento obrigatório.

---

### User Story 4 - Regras de Convivência (Pets e Fumo) (Priority: P2)

Como gestor do hotel, quero definir se o hotel aceita animais de estimação (com limite de peso) e estipular as regras sobre fumo e taxa de desodorização/higienização por infração.

**Why this priority**: Estabelece os limites de convivência animal e normas de preservação do patrimônio e saúde dos quartos.

**Independent Test**: Acessar a aba "Regras da Casa & Pets", ativar ou desativar pet friendly informando peso máximo em kg, e definir permissão de fumo e taxa de higienização.

**Acceptance Scenarios**:

1. **Given** a aba "Regras da Casa & Pets", **When** o usuário ativa o toggle "Pet Friendly", **Then** o campo de peso máximo permitido em kg é habilitado para preenchimento opcional.
2. **Given** as regras sobre fumo, **When** o usuário define se o fumo é permitido ou proibido em áreas fechadas e estipula a taxa de higienização por infração, **Then** as diretrizes são validadas e salvas.

---

### User Story 5 - Serviços Operacionais (Estacionamento & Wi-Fi) (Priority: P3)

Como gestor do hotel, quero parametrizar as comodidades de estacionamento (tipo, valor diário se aplicável, cobertura e necessidade de reserva antecipada) e conectividade Wi-Fi (tipo de sinal, rede, senha e exibição em voucher).

**Why this priority**: Informa com exatidão as comodidades de conectividade e estacionamento para vouchers e confirmações de reserva.

**Independent Test**: Configurar estacionamento pago por dia com tipo de cobertura e credenciais de rede Wi-Fi com senha protegida, salvando e verificando a integridade dos dados.

**Acceptance Scenarios**:

1. **Given** a configuração de estacionamento, **When** o usuário seleciona o tipo de estacionamento (Gratuito, Pago no local, Terceirizado com convênio ou Não possui), **Then** o sistema condiciona a visibilidade e obrigatoriedade do valor da diária aos tipos pagos e registra a cobertura e exigência de reserva prévia.
2. **Given** a configuração de Wi-Fi, **When** o usuário ativa a disponibilidade de rede, define o tipo de cobertura, informa o SSID da rede principal e senha com botão de revelar, optando por exibir os dados no voucher, **Then** os parâmetros são salvos com segurança.

---

### User Story 6 - Navegação Unificada por Abas, Barra Fixa de Ações e Descarte (Priority: P1)

Como gestor do hotel, quero transitar livremente entre as cinco abas de configuração sem perder as alterações em edição, contando com uma barra fixa inferior para salvar tudo de forma consolidada ou descartar todas as modificações pendentes.

**Why this priority**: Previne perda acidental de dados ao alternar entre abas temáticas antes de confirmar as alterações.

**Independent Test**: Modificar campos em diferentes abas, navegar entre elas confirmando a retenção dos valores; testar "Descartar alterações" (reversão aos valores originais) e "Salvar alterações" (gravação atômica com Toast).

**Acceptance Scenarios**:

1. **Given** que o usuário alterou informações na Aba 1 e clica na Aba 3, **When** ele retorna à Aba 1 sem salvar, **Then** os dados editados permanecem preservados no formulário.
2. **Given** alterações não salvas distribuídas em uma ou mais abas, **When** o usuário clica em "Descartar alterações", **Then** todos os campos de todas as abas são revertidos imediatamente aos seus valores persistidos originais.
3. **Given** erros de validação em qualquer aba (ex.: código HEX inválido), **When** o usuário clica em "Salvar alterações", **Then** o salvamento é bloqueado e as mensagens de erro são sinalizadas.
4. **Given** dados válidos, **When** o usuário clica em "Salvar alterações", **Then** a gravação é concluída com sucesso e um aviso Toast confirma a operação.

---

### Edge Cases

- **Formato de cor inválido**: Se o usuário digitar manualmente um código HEX incompatível (ex.: `#GGG`), o sistema rejeita o valor com mensagem de validação imediata sem afetar o preview.
- **Campos condicionais desativados**: Ao desativar opções mestre (ex.: desativar "Pet Friendly" ou "Wi-Fi"), os campos secundários associados mantêm seus valores em memória caso reativados na mesma sessão, mas não impõem regras de validação obrigatória no salvamento se inativos.
- **Recepção sem horários preenchidos**: Se a recepção 24h for desativada e os horários de abertura ou fechamento forem deixados vazios, o salvamento é bloqueado apontando a obrigatoriedade dos horários.
- **Tamanho e proporções de imagem**: Envio de arquivos em formatos diferentes de PNG, SVG ou ICO ou acima do limite de tamanho gera aviso imediato.
- **Falha de conexão no salvamento**: Em caso de erro de rede, os dados em tela são mantidos íntegros com notificação de falha, permitindo nova tentativa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar a página de configurações gerais do hotel acessível na rota `Configurações > Hotel` da aplicação web.
- **FR-002**: A página DEVE ser estruturada em 5 abas principais de navegação:
  - Aba 1: Identidade Visual & Tema
  - Aba 2: Crianças & Hóspedes Extras
  - Aba 3: Horários & Operação
  - Aba 4: Regras da Casa & Pets
  - Aba 5: Estacionamento & Wi-Fi
- **FR-003**: O sistema DEVE permitir upload e substituição de três ativos visuais da marca:
  - Logotipo principal (`logo_primary`) com suporte a fundo transparente;
  - Logotipo para fundos escuros (`logo_dark`);
  - Ícone de favoritos (`favicon`) nos formatos .ico ou .png (resoluções 32x32px ou 64x64px).
- **FR-004**: O sistema DEVE disponibilizar seletores visuais e campos de entrada de código hexadecimal para a paleta de cores do tema:
  - Cor primária (`color_primary`);
  - Cor secundária (`color_secondary`);
  - Cor de fundo (`color_background`);
  - Cor de cartões/superfícies (`color_surface`);
  - Cor de texto principal (`color_text_primary`);
  - Cor de texto secundário (`color_text_secondary`);
  - Cor de destaque (`color_accent`).
- **FR-005**: O sistema DEVE exibir na Aba 1 um card de demonstração (Preview em tempo real) que atualiza dinamicamente elementos de interface simulados com as cores selecionadas.
- **FR-006**: O sistema DEVE coletar e validar os dados institucionais do hotel:
  - Nome fantasia (`hotel_name`, texto obrigatório);
  - Razão social (`legal_name`, texto);
  - CNPJ / Identificador fiscal (`tax_id`, texto formatado com máscara fiscal);
  - Categoria (`category`, opções: Hotel, Pousada, Resort, Hostel, Flat);
  - Classificação por estrelas (`star_rating`, de 1 a 5 estrelas ou "Sem classificação");
  - Descrição resumida/slogan (`short_description`, máximo de 160 caracteres com contador visual);
  - Descrição institucional completa (`full_description`, suporte a formatação de texto multilinha).
- **FR-007**: O sistema DEVE gerenciar as políticas de gratuidade de crianças:
  - Idade máxima para gratuidade (`free_child_age_limit`, inteiro em anos);
  - Quantidade máxima de crianças gratuitas por quarto (`free_child_max_per_room`, inteiro, padrão 1).
- **FR-008**: O sistema DEVE configurar horários operacionais padrão:
  - Início do check-in (`checkin_time`, horário no formato HH:mm);
  - Limite de check-out (`checkout_time`, horário no formato HH:mm).
- **FR-009**: O sistema DEVE gerenciar horários da recepção:
  - Funcionamento 24 horas (`reception_24h`, sim/não);
  - Horários de abertura e fechamento da recepção (obrigatórios se recepção não for 24h).
- **FR-010**: O sistema DEVE gerenciar a política Pet Friendly:
  - Aceitação de pets (`pet_friendly`, sim/não);
  - Limite de peso em kg (`pet_max_weight_kg`, numérico opcional).
- **FR-011**: O sistema DEVE gerenciar a política de fumo:
  - Permissão de fumo em áreas fechadas (`smoking_allowed`, booleano, padrão Não);
  - Taxa de higienização/desodorização por descumprimento (`smoking_sanitization_fee`, valor monetário).
- **FR-012**: O sistema DEVE gerenciar as regras de estacionamento:
  - Modalidade (`parking_type`: Gratuito, Pago no local, Terceirizado com convênio ou Não possui);
  - Valor da diária de estacionamento (`parking_fee_per_day`, condicionado a estacionamento pago);
  - Exigência de reserva antecipada (`parking_reservation_required`, sim/não);
  - Tipo de cobertura (`parking_covered`: Coberto, Descoberto ou Misto).
- **FR-013**: O sistema DEVE gerenciar as configurações de Wi-Fi:
  - Disponibilidade (`wifi_available`, sim/não);
  - Cobertura (`wifi_type`: Gratuito em todas as áreas, Gratuito apenas em áreas comuns ou Pago);
  - Nome da rede principal (`wifi_ssid_default`, texto);
  - Senha padrão (`wifi_password_default`, texto com controle de visibilidade ocultar/revelar);
  - Exibição automática no voucher/e-mail (`wifi_show_on_voucher`, sim/não).
- **FR-014**: O sistema DEVE fornecer uma barra de ação fixa inferior persistente em todas as abas contendo os botões:
  - "Descartar alterações" (reverte todos os campos editados ao estado original salvo);
  - "Salvar alterações" (valida e envia todas as configurações alteradas para persistência).
- **FR-015**: O sistema DEVE exibir notificação em formato Toast informando o resultado da operação (sucesso ou falha).
- **FR-016**: O estado das alterações DEVE ser compartilhado entre as abas, permitindo que o usuário altere dados em diferentes abas e efetue o salvamento consolidado em uma única submissão.

### Key Entities *(include if feature involves data)*

- **Configurações Gerais do Hotel**: Representa o conjunto integral de parâmetros operacionais, regras e temas atribuídos ao hotel locatário (tenant), englobando identidade de marca, gratuidade de crianças, horários de check-in/out e recepção, regras da casa (pets e fumo) e facilidades (estacionamento e Wi-Fi).
- **Identidade Visual & Branding**: Conjunto de parâmetros que define a identidade visual do hotel (logotipo padrão, logotipo para fundo escuro, favicon e paleta de cores primária, secundária, superfície, fundo, textos e destaques).
- **Políticas de Hospedagem & Convivência**: Diretrizes normativas que regem a estadia, incluindo horários operacionais de check-in/out, funcionamento de recepção, política pet e restrições a fumantes com taxa sanitária.
- **Serviços Operacionais e Amenidades**: Especificações de serviços oferecidos pelo estabelecimento (estacionamento e conectividade Wi-Fi protegida por senha e opção de voucher).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O gestor do hotel consegue navegar entre as cinco abas e realizar a configuração completa de todos os parâmetros em menos de 3 minutos em um fluxo contínuo.
- **SC-002**: O preview visual do tema reflete instantaneamente (latência inferior a 100ms) qualquer alteração de cor selecionada na paleta.
- **SC-003**: 100% dos dados editados em diferentes abas são preservados ao transitar entre elas sem necessidade de salvamento intermediário por aba.
- **SC-004**: Ao acionar "Descartar alterações", 100% dos formulários retornam exatamente aos valores salvos anteriormente sem inconsistência de tela.
- **SC-005**: 100% das submissões inválidas (campos obrigatórios ausentes, cores em formato incompatível) são interceptadas com feedback visual imediato antes de qualquer transmissão.
- **SC-006**: Ao salvar com sucesso, a interface fornece confirmação visual clara através de notificação Toast e atualiza o estado original de referência.

## Assumptions

- O usuário que acessa a rota `Configurações > Hotel` já está autenticado e possui privilégios de administração ou gestão para o hotel ativo (contexto multi-tenant garantido).
- O upload de logotipos e favicons aceita arquivos locais em formatos padrão da web (.png, .svg, .ico) e mantém pré-visualizações funcionais no navegador.
- Os parâmetros configurados nesta tela serão consumidos futuramente por outros módulos, tais como motor de reservas, geração de vouchers em PDF/HTML e regras automáticas de orçamentos.
- A navegação entre as 5 abas não recarrega a página completa, preservando o formulário unificado em memória cliente.
- Caso o hotel ainda não tenha nenhuma configuração personalizada registrada, a tela deve carregar com valores padrão razoáveis e seguros (ex.: check-in às 14:00, check-out às 12:00, recepção 24h ativada, fumo não permitido).
