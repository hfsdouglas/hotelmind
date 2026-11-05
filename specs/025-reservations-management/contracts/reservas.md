# Contracts: Reservas e FNRH

## 1. Tipos compartilhados (`packages/.contracts/src/reservas.ts`)

Somente tipos (sem Zod, sem runtime). Exportar em `index.ts`.

```typescript
export type ReservaStatus =
  | 'a_confirmar' | 'confirmada' | 'check_in'
  | 'check_out' | 'no_show' | 'cancelada'

export type FichaStatus = 'pendente' | 'rascunho' | 'preenchida'
export type FichaPreenchidaPor = 'cliente' | 'hotel'

export interface FichaFnrh {
  nome_completo: string | null
  nacionalidade: string | null
  data_nascimento: string | null // YYYY-MM-DD
  sexo: string | null
  profissao: string | null
  tipo_documento: 'cpf' | 'rg' | 'passaporte' | 'outro' | null
  numero_documento: string | null
  logradouro: string | null
  numero_endereco: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais_residencia: string | null
  telefone: string | null
  email: string | null
  motivo_viagem: string | null
  meio_transporte: string | null
  procedencia: string | null
  proximo_destino: string | null
  responsavel_posicao: number | null
}

export interface ReservaHospede extends FichaFnrh {
  id: string
  posicao: number
  ficha_status: FichaStatus
  preenchido_por: FichaPreenchidaPor | null
  preenchido_em: string | null
}

export interface DiariaReserva {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export interface Reserva {
  id: string
  hotel_id: string
  codigo: string
  titular_nome: string
  titular_telefone: string | null
  titular_email: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_comercial_id: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas: number
  valor_total: string
  detalhamento_diarias: DiariaReserva[]
  status: ReservaStatus
  token_fnrh_ativo: boolean
  fnrh_enviada_em: string | null
  fichas_preenchidas: number
  total_hospedes: number
  observacoes: string | null
  quarto?: { id: string; identificacao: string; categoria_nome: string }
  regime_alimentacao?: { id: string; titulo: string; cor_pulseira: string }
  parceiro_comercial?: { id: string; razao_social: string } | null
  hospedes?: ReservaHospede[]
  criado_em: string
  atualizado_em: string
}

export interface CreateReservaPayload {
  titular_nome: string
  titular_telefone?: string | null
  titular_email?: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_comercial_id?: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  observacoes?: string | null
}

export type UpdateReservaPayload = Partial<CreateReservaPayload>

export interface ReservaListParams {
  pagina?: number
  limite?: number
  busca?: string // código ou nome do titular/hóspede
  status?: ReservaStatus
  check_in_de?: string
  check_in_ate?: string
  quarto_id?: string
  regime_alimentacao_id?: string
  parceiro_comercial_id?: string
}

export interface ReservaListResponse {
  data: Reserva[]
  meta: { total: number; pagina: number; limite: number; total_paginas: number }
}

export interface ChangeReservaStatusPayload { status: ReservaStatus }

export interface QuartoDisponivel {
  quarto_id: string
  identificacao: string
  categoria_nome: string
  limite_hospedes: number
  valor_total: string
}

export interface ReservaConflitoErro {
  message: string
  alternativas: QuartoDisponivel[]
}

export interface FnrhLinkInfo { url_token: string; ativo: boolean }

// Página pública (token)
export interface FnrhPublicaView {
  hotel_nome: string
  titular_nome: string
  check_in: string
  check_out: string
  quarto_identificacao: string
  total_hospedes: number
  fnrh_enviada_em: string | null
  hospedes: ReservaHospede[]
}

export type SaveFichaPayload = Partial<FichaFnrh> & { concluir?: boolean }
```

## 2. Endpoints HTTP (API Fastify)

### Autenticados (JWT + hotel do usuário) — prefixo `/reservas`

| Método | Rota | Descrição | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/reservas` | Lista paginada com filtros (`ReservaListParams`) | 200 `ReservaListResponse` | 401 |
| POST | `/reservas` | Cria reserva (`CreateReservaPayload`) | 201 `Reserva` | 400 validação, 404 quarto/regime/parceiro, 409 conflito (`ReservaConflitoErro`), 422 sem tarifa/capacidade |
| GET | `/reservas/:id` | Detalhe com hóspedes | 200 `Reserva` | 404 |
| PUT | `/reservas/:id` | Edita; revalida conflito e recalcula valor (R8) | 200 `Reserva` | 400, 404, 409, 422 |
| PATCH | `/reservas/:id/status` | Muda status conforme transições (R9) | 200 `Reserva` | 404, 422 transição inválida |
| GET | `/reservas/disponibilidade` | Query: `check_in, check_out, regime_alimentacao_id, pessoas` → `QuartoDisponivel[]` | 200 | 400 |
| PUT | `/reservas/:id/hospedes/:posicao` | Hotel preenche/edita ficha (`SaveFichaPayload`) | 200 `ReservaHospede` | 404, 422 |
| POST | `/reservas/:id/link-fnrh/regenerar` | Novo token (invalida o anterior) | 200 `FnrhLinkInfo` | 404, 422 reserva inativa |
| POST | `/reservas/:id/link-fnrh/desativar` | Desativa o link | 200 `FnrhLinkInfo` | 404 |

### Públicos (sem auth, rate limit) — prefixo `/reservas/publico/:token`

| Método | Rota | Descrição | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/reservas/publico/:token` | Resumo + hóspedes/fichas | 200 `FnrhPublicaView` | 404 genérico |
| PUT | `/reservas/publico/:token/hospedes/:posicao` | Salva rascunho da ficha | 200 `ReservaHospede` | 404 genérico, 422 campos |
| POST | `/reservas/publico/:token/enviar` | "Enviar ao hotel": exige todas as fichas completas | 200 `{ fnrh_enviada_em }` | 404 genérico, 422 lista de posições pendentes |

Regras: nenhum endpoint público aceita alterar quantidade de hóspedes; `posicao` fora de 1..N → 404. Respostas públicas nunca incluem valores, parceiro ou observações internas.

## 3. Contrato de UI

| Rota web | Tela | Acesso |
|---|---|---|
| `/reservas` | Listagem com filtros e indicador `fichas_preenchidas/total_hospedes` | autenticado |
| `/reservas/nova` | Formulário sequencial: período+pessoas → regime → suíte (apenas disponíveis, com tarifa) → titular/parceiro | autenticado |
| `/reservas/:id` | Detalhe/edição, status, hóspedes e fichas, copiar/regenerar/desativar link | autenticado |
| `/fnrh/:token` | Formulário FNRH mobile-first (um cartão por hóspede, salvar progresso, "Enviar ao hotel") | público |
