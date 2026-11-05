# Research: Gestão de Reservas com Ficha de Hóspedes (FNRH)

Nenhum `NEEDS CLARIFICATION` ficou aberto no Technical Context. Decisões abaixo.

## R1. "Suíte" = `Quarto` físico; tarifa vem da categoria

- **Decision**: A reserva referencia `quarto_id` (unidade física, com `limite_hospedes`). Categoria é derivada de `quarto.categoria_id`. Tarifas são buscadas por `categoria + regime + período` via `ITarifarioRepository.find_active_for_range` e `TarifarioPricingService.calcular_reserva` (reuso do fluxo de orçamentos).
- **Rationale**: FR-004a exige conflito por suíte específica; tarifários existentes são por categoria. `Quarto` já tem capacidade (FR-004).
- **Alternatives**: Reservar por categoria (como orçamento) — não permite detectar conflito por suíte nem sugerir "outra suíte".

## R2. Conflito de suíte sem corrida (FR-004a)

- **Decision**: Pré-checagem na camada de use case (mensagem amigável + sugestões) e garantia final no banco via *exclusion constraint* PostgreSQL (`btree_gist`) em `(quarto_id, daterange(check_in, check_out))` filtrada por status ativos (`a_confirmar`, `confirmada`, `check_in`, `check_out`). Violação é mapeada para o mesmo erro de conflito.
- **Rationale**: Check-then-insert sozinho permite dupla reserva concorrente. `daterange` semiaberto `[in, out)` implementa "mesmo dia de saída/entrada não conflita". Status `cancelada`/`no_show` ficam fora do filtro, e transições para estados inativos liberam a suíte automaticamente.
- **Alternatives**: `pg_advisory_xact_lock` por quarto (funciona, porém mais código e fácil de esquecer); `SERIALIZABLE` (retries complexos).
- **Note**: Prisma não modela exclusion constraints — vai em SQL manual na migração. Reativar reserva não existe (estados finais), logo não há risco de violação inesperada em transição.

## R3. Sugestão de suítes alternativas

- **Decision**: Endpoint `GET /reservas/disponibilidade` retorna quartos ativos do hotel com `limite_hospedes >= pessoas`, sem conflito no período e com tarifa cobrindo todas as diárias para o regime. A resposta 409 de conflito inclui até 5 alternativas já calculadas (mesmo use case de disponibilidade, reutilizado).
- **Rationale**: Atende "sugerir outras suítes" em um clique e serve ao seletor do formulário (somente combinações com tarifa — FR-002).
- **Alternatives**: Calcular só no frontend — duplicaria regra de negócio.

## R4. Token público (FR-011)

- **Decision**: `randomBytes(24).toString('base64url')` (192 bits), armazenado em `reservas.token_fnrh` (único, índice) com flag `token_fnrh_ativo`. Regenerar substitui o valor; desativar apenas zera a flag. Validade: ativo e status em `a_confirmar|confirmada|check_in` e data atual ≤ `check_out`.
- **Rationale**: Mesmo padrão de `token_publico` dos orçamentos, com mais entropia (dados pessoais). Todas as falhas retornam 404 genérico (FR-019) para não permitir enumeração.
- **Alternatives**: JWT assinado (não revogável sem lista); UUID v4 (122 bits, menos adequado a PII).

## R5. Rate limit na rota pública (FR-020)

- **Decision**: Adicionar `@fastify/rate-limit`, registrado como plugin de infraestrutura e aplicado apenas às rotas `/reservas/publico/*` (por IP e por token), p.ex. 30 req/min para leitura e 10/min para escrita.
- **Rationale**: Dependência ainda não existe no projeto; é a solução oficial Fastify.
- **Alternatives**: Rate limit em proxy reverso (fora do controle do repositório).

## R6. Modelagem da FNRH

- **Decision**: Tabela `reserva_hospedes`, uma linha por pessoa (`posicao` 1..N), com colunas de ficha anuláveis (1:1, sem tabela separada). `ficha_status`: `pendente | rascunho | preenchida`. `preenchido_por`: `cliente | hotel`. Documentos armazenam apenas dígitos para CPF; estrangeiros usam `tipo_documento` (`cpf|rg|passaporte|outro`) e `pais_residencia`.
- **Rationale**: Ficha só existe junto do hóspede; evita joins e mantém a restrição "exatamente N posições" simples.
- **Alternatives**: Tabelas `hospedes` globais reutilizáveis entre reservas (histórico de cliente) — fora do escopo.
- **Campos FNRH** (FR-013): nome, nacionalidade, data de nascimento, sexo, profissão, documento (tipo/número), endereço (ou país), telefone, e-mail, motivo da viagem, meio de transporte, procedência, próximo destino, responsável (para menores).

## R7. Ajuste de posições ao mudar quantidade de pessoas

- **Decision**: Aumento cria posições vazias no fim; redução só remove posições `pendente` (sem dados), da última para a primeira; se houver ficha preenchida nas posições a remover, retorna erro 422 indicando quais fichas. Titular (posição 1) nunca é removido.
- **Rationale**: Garante US4 cenário 3 sem perder dados pessoais.

## R8. Edição de período, suíte, regime (pergunta 5 da clarificação — não respondida)

- **Decision (default adotado, revisável)**: Edição permitida enquanto status for `a_confirmar` ou `confirmada`. Ao alterar período, suíte, regime ou pessoas, rechecar conflito e **recalcular** o valor com as tarifas vigentes.
- **Rationale**: É a opção recomendada na clarificação; comportamento mais seguro e previsível. Se o usuário decidir outra regra, só muda o use case `editar_reserva_use_case`.
- **Alternatives**: Permitir apenas em `a_confirmar`; manter valor original com ajuste manual.

## R9. Máquina de estados (FR-005a)

- **Decision**: Serviço de domínio puro `ReservaStatusService` com mapa de transições: `a_confirmar → confirmada|cancelada`; `confirmada → check_in|no_show|cancelada`; `check_in → check_out`; demais finais. Cada mudança grava linha em `reserva_status_historico` (status_anterior, status_novo, usuário, data).
- **Rationale**: Regra testável sem banco; histórico atende FR-010/FR-005a.

## R10. Parceiro (FR-006)

- **Decision**: `parceiro_comercial_id` opcional (FK `ParceiroComercial`). Validação: parceiro existe no hotel e `ativo` no momento de criar/alterar o vínculo; reservas existentes mantêm parceiro inativo.
- **Dependency**: Verificar campo/status de ativação em `ParceiroComercial` na implementação.

## R11. Permissões e rotas de navegação

- **Decision**: Registrar `/reservas` (lista), `/reservas/nova` e `/reservas/:id` em `routes_seed.ts` seguindo o padrão de orçamentos. Sem permissão extra para dados da FNRH (clarificação 3). Rotas públicas sem autenticação, fora de `AppLayout`.
