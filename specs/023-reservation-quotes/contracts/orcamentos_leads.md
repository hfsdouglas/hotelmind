# Contratos HTTP e de Interface: Orçamentos e Leads

## 1. Endpoints da API Fastify

### 1.1. Leads (`/leads`)

Todos os endpoints de gestão de leads requerem autenticação (`onRequest: [app.authenticate]`).

- `POST /leads`
  - **Body**: `{ nome: string, telefone: string, email: string }`
  - **Status 201**: Retorna o `Lead` criado.
  - **Status 400**: Erro de validação Zod.

- `GET /leads`
  - **Query**: `{ pagina?: number, limite?: number, busca?: string }`
  - **Status 200**: Retorna `LeadListResponse`.

- `GET /leads/:id`
  - **Params**: `{ id: string }`
  - **Status 200**: Retorna `Lead`.
  - **Status 404**: `LeadNotFoundError`.

---

### 1.2. Orçamentos (`/orcamentos`)

#### Endpoints Administrativos (Autenticados com `app.authenticate`)

- `POST /orcamentos`
  - **Body**:
    ```json
    {
      "regime_alimentacao_id": "uuid",
      "categoria_quarto_id": "uuid",
      "check_in": "2026-12-01",
      "check_out": "2026-12-05",
      "quantidade_adultos": 2,
      "quantidade_criancas": 1,
      "quantidade_pets": 0,
      "observacoes": "Check-in tardio",
      "lead": {
        "nome": "Maria Silva",
        "telefone": "11999998888",
        "email": "maria@exemplo.com"
      }
    }
    ```
  - **Comportamento**:
    1. Verifica existência e ativação do `regime_alimentacao_id` e `categoria_quarto_id`.
    2. Localiza ou cria o `Lead` via dados fornecidos.
    3. Calcula o valor das diárias para o período com base nos tarifários ativos que cobrem aquele regime e categoria (sem validar disponibilidade física de quartos).
    4. Gera o `token_publico` criptograficamente seguro e persiste o `Orcamento`.
  - **Status 201**: Retorna o `Orcamento` persistido.
  - **Status 400**: Erros de validação ou período inválido.

- `GET /orcamentos`
  - **Query**: `{ pagina?: number, limite?: number, busca?: string, regime_alimentacao_id?: string, status?: string }`
  - **Status 200**: Retorna `OrcamentoListResponse`.

- `GET /orcamentos/:id`
  - **Params**: `{ id: string }`
  - **Status 200**: Retorna `Orcamento` com dados de lead, categoria e regime.
  - **Status 404**: `OrcamentoNotFoundError`.

- `PUT /orcamentos/:id`
  - **Params**: `{ id: string }`
  - **Body**: `UpdateOrcamentoPayload`
  - **Status 200**: Retorna `Orcamento` atualizado.
  - **Status 404**: `OrcamentoNotFoundError`.

- `DELETE /orcamentos/:id`
  - **Params**: `{ id: string }`
  - **Status 204**: Exclusão realizada com sucesso.
  - **Status 404**: `OrcamentoNotFoundError`.

---

#### Endpoint Público (Sem Autenticação)

- `GET /orcamentos/publico/:token`
  - **Params**: `{ token: string }`
  - **Autenticação**: Nenhuma (acesso público para o lead).
  - **Status 200**: Retorna `OrcamentoPublicoVisualizacao`:
    ```json
    {
      "token_publico": "c3f1b0a...",
      "hotel_nome": "Hotel Paraíso das Águas",
      "hotel_telefone": "(11) 4002-8922",
      "check_in": "2026-12-01",
      "check_out": "2026-12-05",
      "total_noites": 4,
      "quantidade_adultos": 2,
      "quantidade_criancas": 1,
      "quantidade_pets": 0,
      "regime_alimentacao": {
        "nome": "Café da Manhã",
        "cor": "#3b82f6",
        "descricao": "Buffet completo servido das 06h às 10h"
      },
      "categoria_quarto": {
        "nome": "Suíte Luxo Vista Mar"
      },
      "lead_nome": "Maria Silva",
      "detalhamento_noites": [
        { "data": "2026-12-01", "valor_diaria": "350.00", "tarifario_nome": "Tarifa Padrão" },
        { "data": "2026-12-02", "valor_diaria": "350.00", "tarifario_nome": "Tarifa Padrão" },
        { "data": "2026-12-03", "valor_diaria": "350.00", "tarifario_nome": "Tarifa Padrão" },
        { "data": "2026-12-04", "valor_diaria": "350.00", "tarifario_nome": "Tarifa Padrão" }
      ],
      "valor_total": "1400.00",
      "status": "pendente",
      "criado_em": "2026-11-04T19:00:00Z"
    }
    ```
  - **Status 404**: `"Orçamento não encontrado ou link expirado."`

---

## 2. Rotas do Frontend (`packages/web`)

### 2.1. Rotas Privadas (dentro do `AppLayout`)
- `/reservas/orcamentos`: Listagem paginada, filtros, ações de edição, exclusão e atalho "Copiar Link".
- `/reservas/orcamentos/novo`: Criação em passos (Passo 1: Período e Hóspedes; Passo 2: Regime de Alimentação e Carregamento de Suítes com Tarifário; Passo 3: Seleção da Categoria e Dados do Lead).
- `/reservas/orcamentos/:id/editar`: Edição de informações e botões de ação:
  - Botão "Copiar link de visualização"
  - Botão fictício "Enviar por E-mail"
  - Botão fictício "Enviar no WhatsApp"

### 2.2. Rota Pública Mobile-First (fora do `AppLayout`)
- `/orcamento/:token`: Página autônoma com cartão responsivo, cores institucionais do regime de alimentação, resumo de valores e botão fictício "Reservar" (com modal informativo de lançamento em breve).
