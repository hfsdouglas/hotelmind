# Phase 0 Research: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

## 1. Modelagem e Persistência de Leads ("Primeiro Contato")

- **Decision**: Criar a tabela `leads` no PostgreSQL gerenciada via Prisma com as seguintes características:
  - `id`: UUID (chave primária)
  - `hotel_id`: UUID referenciando `hoteis(id)` com `onDelete: Cascade`
  - `nome`: String (VarChar 150)
  - `telefone`: String (VarChar 30), com suporte a DDD e número de celular/WhatsApp
  - `email`: String (VarChar 150)
  - `created_at` e `updated_at`
  - Índices em `[hotel_id, email]` e `[hotel_id, telefone]`
- **Rationale**:
  - Leads representam o primeiro contato comercial do hotel. Separar o lead de hóspedes formalmente cadastrados preserva a higienização da base de hóspedes (que costuma exigir CPF, RG, endereço fiscal e dados completos de faturamento).
  - O operador pode cadastrar o lead no próprio fluxo de geração do orçamento ou pesquisar um lead preexistente.
- **Alternatives considered**:
  - Salvar dados do lead apenas como campos desnormalizados em `orcamentos`: Rejeitado por violar a solicitação expressa do usuário de ter uma tabela própria para leads e por impedir o histórico unificado de cotações de um mesmo contato.
  - Reutilizar a entidade de hóspedes: Rejeitado porque a grande maioria dos contatos iniciais não possui todos os dados cadastrais obrigatórios de check-in.

## 2. Armazenamento Autônomo de Orçamentos e Desacoplamento de Inventário

- **Decision**: Criar a tabela `orcamentos` independente da tabela de reservas:
  - `id`: UUID
  - `hotel_id`: UUID
  - `lead_id`: UUID (chave estrangeira para `leads`)
  - `regime_alimentacao_id`: UUID (chave estrangeira para `regimes_alimentacao`)
  - `categoria_quarto_id`: UUID (chave estrangeira para `categorias_quartos`)
  - `check_in`: String ISO `YYYY-MM-DD`
  - `check_out`: String ISO `YYYY-MM-DD`
  - `quantidade_adultos`: Inteiro (mínimo 1)
  - `quantidade_criancas`: Inteiro (default 0)
  - `quantidade_pets`: Inteiro (default 0)
  - `valor_total`: String decimal monetária (`0.00`)
  - `detalhamento_noites`: Json contendo a relação de diárias calculadas (`data`, `tarifario_id`, `tarifario_nome`, `valor_diaria`)
  - `token_publico`: String única e não adivinhável (índice único)
  - `status`: String (`pendente`, `aprovado`, `cancelado`, `expirado`)
  - `observacoes`: String opcional
  - `created_at` e `updated_at`
- **Rationale**:
  - O orçamento não deve alocar quartos físicos nem criar bloqueios no mapa de ocupação hoteleira.
  - O cálculo do orçamento neste momento não deve validar a disponibilidade física de quartos no período, assegurando cotações ágeis mesmo em alta temporada.
- **Alternatives considered**:
  - Reutilizar a tabela de reservas com um campo `status = 'ORCAMENTO'`: Rejeitado por acoplar inventário, quartos alocados e status operacionais complexos a uma simples proposta comercial.

## 3. Fluxo de Criação Sequencial (Período -> Regime de Alimentação -> Suítes com Tarifário)

- **Decision**: Estruturar o fluxo de criação do orçamento no frontend em passos orientados:
  1. **Passo 1**: Definição do período de hospedagem (datas de check-in e check-out) e quantidade de ocupantes (adultos, crianças e pets opcionais).
  2. **Passo 2**: Seleção do Regime de Alimentação desejado (ex.: Café da Manhã, Meia Pensão, Pensão Completa, All Inclusive).
  3. **Passo 3**: Carregamento dinâmico e seleção das suítes/categorias de acomodação disponíveis com base nos tarifários vigentes configurados para o período e regime.
  4. **Passo 4**: Identificação ou cadastro do Lead ("Primeiro Contato": Nome, Telefone WhatsApp, E-mail) e confirmação do cálculo.
- **Rationale**:
  - Definir o período primeiro permite consultar exatamente os tarifários vigentes para as datas da estada. A seleção subsequente do regime filtra os pacotes de refeição aplicáveis e expõe apenas as suítes/categorias que contam com tarifários ativos cadastrados para aquela combinação de datas e regime.
- **Alternatives considered**:
  - Selecionar o regime antes das datas: Descartado pois sem o período definido não é possível carregar com precisão quais suítes possuem tarifários cadastrados para as datas da estada.

## 4. Visualização Pública Mobile-First e Token Seguro

- **Decision**:
  - Gerar um `token_publico` criptograficamente seguro (UUID v4 sem hífens ou nanoid de 32 caracteres) no momento em que o orçamento é salvo.
  - Expor rota pública na API: `GET /orcamentos/publico/:token` sem middleware de autenticação JWT, retornando apenas os dados necessários da proposta (nome do hotel, período, categoria, regime de alimentação com cor, total de pessoas/pets, valor discriminado e nome do lead).
  - No frontend (`packages/web`), registrar rota pública `/orcamento/:token` fora do `AppLayout` autenticado.
  - Desenvolver a interface focada prioritariamente em dispositivos móveis (mobile-first), com largura adaptável, tipografia limpa, cartões de destaque e sem necessidade de scroll horizontal.
- **Rationale**:
  - A maioria esmagadora de links recebidos via WhatsApp é aberta diretamente em smartphones. A página deve carregar instantaneamente sem pedir senhas.
- **Alternatives considered**:
  - Expor a URL com o ID sequencial ou UUID primário do banco: Rejeitado por boas práticas de segurança (evita enumeração de propostas) e para permitir futura revogação de tokens.

## 5. Ações Fictícias de Comunicação e Reserva

- **Decision**:
  - **No painel interno (`web`)**:
    - "Copiar link": Copia a URL da página pública (`window.location.origin + '/orcamento/' + token`) via Clipboard API com toast de confirmação.
    - "Enviar por E-mail": Botão que simula o disparo com toast informativo (`"Simulação: Proposta enviada para o e-mail {email}!"`).
    - "Enviar no WhatsApp": Botão que simula o envio com toast informativo e gera opção opcional de redirecionar para link `https://wa.me/{numero}?text={texto_proposta}` para conveniência imediata.
  - **Na página pública (`/orcamento/:token`)**:
    - Botão "Reservar": Botão destacado que abre um diálogo informativo (`"A confirmação de reserva online direta estará disponível em breve! Entre em contato com nossa recepção para confirmar este orçamento."`).
- **Rationale**:
  - Fornece valor imediato ao operador (cópia rápida e link direto) enquanto prepara a base visual e de usabilidade para futuras integrações de mensageria e motor de reservas online.
