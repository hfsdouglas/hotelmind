# Research: 031-calendar-range-selection

## R1. Mapeamento do intervalo para check-in/check-out

- **Decision**: dia mais antigo = `check_in`; dia mais recente = `check_out`. Mínimo de 2 dias distintos.
- **Rationale**: o calendário já desenha cada reserva do dia de check-in (terço direito) ao dia de check-out (terço esquerdo); a célula final da seleção representa o dia de saída, mantendo a leitura visual consistente. Evita reservas com 0 diárias, que o form/API rejeitam.
- **Alternatives**: `check_out = fim + 1` (cada célula = uma noite) foi rejeitado por contradizer a forma das barras; aceitar 1 célula como 1 diária criaria seleção visual menor que o período reservado.

## R2. Mecânica do arraste

- **Decision**: eventos de mouse (`mousedown` no `td`, `mouseenter` nos `td` de dia, `mouseup` na `window`). Estado armazena datas ISO (`AAAA-MM-DD`), não índices.
- **Rationale**: `mouseenter` dispara ao entrar no `td` mesmo passando por cima das barras; `mouseup` global finaliza mesmo fora da tabela. Datas sobrevivem a resize/mudança de dias visíveis. Pointer Events com captura atrapalhariam o `mouseenter` nas outras células.
- **Alternatives**: biblioteca de DnD (desnecessária, nenhuma dependência nova); índices de coluna (quebram ao redimensionar).

## R3. Conflito com o clique de detalhes da reserva

- **Decision**: `ReservationCell` chama `event.stopPropagation()` no `mousedown`; o `td` só inicia arraste com `event.button === 0` (`PRIMARY_MOUSE_BUTTON`).
- **Rationale**: preserva exatamente o comportamento atual de abrir detalhes e mantém a regra explícita na fonte.
- **Alternatives**: checar `target.closest(...)` no `td` (acoplamento implícito ao DOM do filho).

## R4. Clique fora

- **Decision**: listener de `mousedown` no `document`, ignorando alvos dentro das refs da grade e da barra de ações; parâmetro `paused` desliga listeners de clique-fora e Esc enquanto um modal do calendário está aberto. Handlers de navegação também chamam `clear()`.
- **Rationale**: o modal do Radix é renderizado em portal (fora das refs) e seu overlay também; pausar evita limpar a seleção ao interagir com o modal ou fechá-lo (FR-005/FR-016).
- **Alternatives**: checar `closest('[role="dialog"]')` (não cobre o overlay); `onBlur` (não confiável para tabela).

## R5. Compartilhamento do formulário

- **Decision**: extrair de `nova.tsx`: `useNovaReservaOpcoes` (queries de regimes, parceiros e disponibilidade), `useNovaReservaForm` (useForm + mutação + estado de conflito 409 + toasts + invalidação de `['reservas']`, com `onSuccess` injetado) e `NovaReservaFormFields` (todas as seções + `ModalConflitoReserva` + aviso de suíte preferida). Página e modal são invólucros finos.
- **Rationale**: "formulário idêntico" passa a ser garantido por construção; `CrudFormLayout` continua dono do `<form>` na página e o modal tem seu próprio `<form>` (CrudFormLayout tem link de voltar e layout de página, inadequado num dialog).
- **Alternatives**: renderizar `NovaReservaPage` dentro do modal (navegação e header de página indevidos); duplicar o form (divergência garantida).

## R6. Suíte preferida

- **Decision**: efeito em `NovaReservaFormFields`: quando `quartoPreferido` existe, a disponibilidade terminou de carregar (`podeConsultar && !isFetching`) e `quarto_id` está vazio → se a lista contém a suíte, `setValue('quarto_id', id, { shouldValidate: true })` e a categoria ativa segue a suíte; senão, mostra o aviso de indisponibilidade.
- **Rationale**: o form limpa `quarto_id` ao mudar datas/regime/parceiro; reaplicar a preferida enquanto estiver vazio e disponível é o comportamento esperado. Se o operador escolher outra suíte, `quarto_id` não está vazio e a preferida não sobrescreve.
- **Alternatives**: setar `quarto_id` direto nos valores iniciais (seria limpo ao escolher o regime e poderia apontar para suíte sem tarifa).

## R7. Pós-sucesso no modal

- **Decision**: `useNovaReservaForm` sempre faz `toast.success` e invalida `['reservas']`; o calendário passa `onCreated` que fecha o modal e limpa a seleção; a página passa `onSuccess` que navega para `/reservas/:id`.
- **Rationale**: a query do calendário (`['reservas','calendario']`) é atingida pela invalidação por prefixo.

## R8. Testes

- **Decision**: testes novos usam MSW (`server.use(...)` para cenários específicos) e `render` com `QueryClientProvider`/`MemoryRouter`; handlers padrão novos para disponibilidade, criação, regimes (dois ativos: "Pensão Completa" e "Meia Pensão") e tarifários (só "Pensão Completa" na categoria das 101/102), usados também pelo E2E. `nova.spec.tsx` existente (usa `vi.mock` de serviços) fica como rede de segurança da refatoração e não é reescrito nesta feature.
- **Rationale**: regra do front-end exige MSW para testes; não alterar asserções existentes garante "sem regressão".

## R9. Regimes da suíte preferida (revisão 2026-11-12)

- **Decision**: em `useNovaReservaOpcoes`, com `quartoPreferidoId`: `GET /quartos?limite=250` (key `['quartos','para_regimes','lista']`) para achar o `categoria_id` da suíte; depois `GET /tarifarios?categoria_quarto_id=…&ativo=true&limite=250` (key `['tarifarios','ativos_da_categoria', categoriaId]`; keys com prefixo de domínio para que invalidações de `['quartos']`/`['tarifarios']` cascateiem); `regimes` = regimes ativos cujo id aparece (distinto) nesses tarifários. `carregandoRegimes` é `true` enquanto a lista de regimes ativos está pendente (com ou sem suíte) e, com suíte, enquanto `/quartos` ou `/tarifarios` estão pendentes; `erroRegimes` é `true` em erro de `/regimes_alimentacao` ou, com suíte, de `/quartos`/`/tarifarios` (falha fechada); em ambos `regimes = []`, e o componente mostra texto de carregamento ou bloco `role="alert"` em vez de lista ou mensagem de vazio. Categoria não resolvida numa resposta bem-sucedida de `/quartos` → todos os regimes ativos. Sem suíte → todos os regimes ativos, sem chamar `/quartos` nem `/tarifarios`. O período não filtra.
- **Rationale**: atende ao pedido sem mudar `api`/`.contracts`; os endpoints e tipos (`Quarto.categoria_id`, `Tarifario.regime_alimentacao_id`) já existem e são escopados pelo JWT. Não mostrar a lista completa durante o carregamento evita que o operador escolha um regime que some em seguida; falhar fechado em erro evita oferecer regimes não vendidos para a suíte; mostrar a mensagem de vazio só após sucesso evita o "piscar" em `/reservas/nova`. Os tarifários da categoria incluem os de parceiros (`parceiro_id`), então o filtro é só por categoria (a disponibilidade valida parceiro e datas).
- **Alternatives**: endpoint novo de regimes por suíte ou filtro por data em `/tarifarios` (mais preciso, mas exige mudança de API: registrado como melhoria futura); `GET /quartos/:id` via `quartosService.get(id)` (não usado: a lista já é usada no calendário e o limite de 250 cobre o porte esperado; fica como follow-up opcional para eliminar o fallback); filtrar pela disponibilidade (exige regime escolhido, circular).

## R10. Grade de regimes antes das datas e rolagem do modal (revisão 2026-11-12)

- **Decision**: o Passo 3 deixa de depender de diárias > 0; as suítes continuam dependendo de `podeConsultar`. O `DialogContent` usa `overflow-y-auto scrollbar-none`, com `.scrollbar-none` definido em `src/index.css` (`@layer utilities`) cobrindo Firefox (`scrollbar-width`), Edge legado (`-ms-overflow-style`) e WebKit/Blink (`::-webkit-scrollbar`).
- **Rationale**: sem datas, o operador escolhe o regime primeiro e as suítes carregam assim que datas e pessoas completam os critérios. Uma utility local evita dependência nova (plugin Tailwind).
- **Alternatives**: `tailwind-scrollbar-hide` (dependência nova desnecessária); `overflow-hidden` (perderia a rolagem).

## R11. Pré-seleção do primeiro regime com período e suíte (revisão 2026-11-12)

- **Decision**: em `NovaReservaFormFields`, um `useEffect` guardado por `useRef(false)` (molde do efeito da suíte preferida de R6; nenhum `useState` espelhando dados de query) chama `setValue('regime_alimentacao_id', regimes[0].id, { shouldValidate: true })` e marca a flag quando, ao mesmo tempo: a flag está desligada, há `quartoPreferido`, o período é válido (`check_in && check_out && check_in < check_out`), `!carregandoRegimes && !erroRegimes`, `regimes[0]` existe e `regime_alimentacao_id` está vazio. O efeito não toca em `quarto_id`: com o regime preenchido, `podeConsultar` fica verdadeiro, a disponibilidade roda e o efeito de R6 marca a suíte preferida (ou o aviso aparece). A ordem é a de `regimes` do hook (ordem da API de regimes filtrada pela categoria).
- **Rationale**: entrega "regime e suíte selecionados" reutilizando o fluxo existente (disponibilidade como fonte da verdade da suíte, sem `quarto_id` apontando para suíte sem tarifa). A flag garante "uma vez por abertura": o modal monta o formulário só com `open`, então cada abertura recomeça; o clique do operador em outro regime nunca é sobrescrito. Restringir a suíte + período mantém `/reservas/nova` e o modal sem seleção idênticos ao comportamento anterior (FR-017).
- **Alternatives**: pôr o regime em `valoresIniciais` (a lista ainda não é conhecida na abertura e depende da categoria da suíte); setar `quarto_id` junto com o regime (pularia a validação de disponibilidade e seria limpo pela troca de regime); efeito sem flag (re-aplicaria o primeiro regime em mudanças posteriores da lista); estado `useState` para "já pré-selecionado" (re-render desnecessário, a flag não é exibida).
