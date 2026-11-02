# Contrato HTTP: Categorias de Quarto

Todos os recursos exigem a autenticação existente e usam o hotel associado à sessão; `hotel_id` não é aceito pelo cliente no corpo.

## `GET /categorias_quartos`

Lista categorias do hotel atual. Suporta paginação e filtro de status conforme o padrão de listagens existente.

Resposta `200`:

```json
{
  "data": [{
    "id": "uuid",
    "hotel_id": "uuid",
    "nome": "Suíte",
    "status": "S",
    "created_at": "2026-11-02T12:00:00.000Z",
    "updated_at": "2026-11-02T12:00:00.000Z"
  }],
  "meta": { "pagina": 1, "limite": 20, "total": 1, "ultima_pagina": 1 }
}
```

## `POST /categorias_quartos`

Request: `{ "nome": "Suíte", "status": "S" }`.

Resposta `201`: objeto `CategoriaQuarto` criado. Retorna `409` para nome duplicado e `400` para validação inválida.

## `GET /categorias_quartos/:id`

Retorna uma categoria do hotel atual ou `404` quando ela não existe nesse contexto.

## Erros comuns

- `401`: sessão ausente ou inválida.
- `400`: corpo ou parâmetros inválidos.
- `404`: recurso não encontrado no hotel atual.
- `409`: nome duplicado.
