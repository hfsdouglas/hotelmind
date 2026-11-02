# Contrato HTTP: Quartos

Todos os recursos exigem a autenticação existente e usam o hotel associado à sessão; `hotel_id` não é aceito pelo cliente no corpo.

## `GET /quartos`

Lista quartos do hotel atual. Aceita `categoria_id`, paginação, busca por identificação e ordenação conforme o padrão de listagens existente. Cada item inclui sua categoria e camas.

Resposta `200`:

```json
{
  "data": [{
    "id": "uuid",
    "hotel_id": "uuid",
    "categoria_id": "uuid",
    "identificacao": "101",
    "limite_hospedes": 3,
    "categoria": { "id": "uuid", "nome": "Suíte", "status": "S" },
    "camas": [{ "id": "uuid", "tipo": "casal", "quantidade": 1 }],
    "created_at": "2026-11-02T12:00:00.000Z",
    "updated_at": "2026-11-02T12:00:00.000Z"
  }],
  "meta": { "pagina": 1, "limite": 20, "total": 1, "ultima_pagina": 1 }
}
```

## `POST /quartos`

Cria um quarto e sua composição de camas atomicamente.

Request:

```json
{
  "categoria_id": "uuid",
  "identificacao": "101",
  "limite_hospedes": 3,
  "camas": [{ "tipo": "casal", "quantidade": 1 }]
}
```

Resposta `201`: objeto `Quarto` criado com categoria e camas. Retorna `400` para dados inválidos, `404` para categoria inexistente/inativa e `409` para identificação duplicada.

## `GET /quartos/:id`

Retorna um quarto completo do hotel atual, incluindo categoria e configurações de cama, ou `404` quando ele não existe nesse contexto.

## Tipos de cama

O schema deve aceitar somente os valores definidos pelo domínio. A lista inicial deve ser documentada no contrato e utilizada pela interface para não permitir valores livres inconsistentes.
