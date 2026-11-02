# Research: Cadastro de Categorias e Quartos

## Decision: Reutilizar o padrão de agregados e rotas de grupos

**Rationale**: A API já separa contratos, schemas, entidades, interfaces de repositório, implementações Prisma, casos de uso e rotas. O novo domínio deve seguir a mesma composição para manter as fronteiras da constituição e permitir testes isolados.

**Alternatives considered**: Persistência direta na rota ou CRUD genérico. A primeira viola as responsabilidades de camada; a segunda esconderia regras específicas de categoria, unicidade e composição de camas.

## Decision: Separar categoria, quarto e configuração de cama

**Rationale**: Uma categoria agrupa vários quartos; um quarto precisa possuir uma ou mais linhas de cama. Três entidades tornam a cardinalidade e as validações explícitas.

**Alternatives considered**: Armazenar camas como texto ou JSON no quarto, o que dificultaria validação e evolução dos tipos.

## Decision: Rotas públicas do domínio em português e no plural

**Rationale**: O projeto usa recursos em português (`/grupos`, `/usuarios`) e arquivos snake_case. Serão usados `/categorias_quartos` e `/quartos`, protegidos por autenticação e limitados ao `hotelId` da sessão.

**Alternatives considered**: Rotas aninhadas como `/categorias_quartos/:id/quartos`. A consulta por `categoria_id` em `/quartos` mantém listagem geral e filtrada com o mesmo contrato.

## Decision: Cadastro de quarto atômico

**Rationale**: Categoria, quarto e camas precisam ser persistidos como uma única intenção. Uma transação no adaptador de persistência evita quarto sem camas ou camas órfãs quando uma etapa falha.

**Alternatives considered**: Criar quarto e camas em chamadas separadas, o que expõe estados parciais.

## Decision: Tipos de cama controlados pelo produto

**Rationale**: A especificação exige tipo e quantidade, mas não pede cadastro de novos tipos. O formulário usará opções estáveis definidas pelo domínio, permitindo várias opções no mesmo quarto.

**Alternatives considered**: Campo de texto livre, que permitiria grafias duplicadas.

## Decision: Escopo inicial limitado a criar e consultar

**Rationale**: A feature solicitada é a criação, com consultas necessárias para listar categorias e quartos e selecionar a categoria. Alterar, inativar ou excluir quartos não é necessário para validar o fluxo principal.

**Alternatives considered**: CRUD completo imediatamente, que ampliaria regras sem ser necessário para o objetivo atual.
