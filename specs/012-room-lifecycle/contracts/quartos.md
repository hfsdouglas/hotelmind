# Room Contracts

## `GET /quartos`

Query parameters include `pagina`, `limite`, partial case-insensitive `busca`, `categoria_id` and optional `status=S|N`. `limite` accepts only `25`, `50`, `100` or `250`, defaulting to `25`; values below 25 are invalid. The `busca` predicate matches identification, category name or bed type. The response includes `descricao`, `status` and pagination metadata for each room.

## `POST /quartos`

Request body:

```json
{
  "categoria_id": "category-id",
  "identificacao": "0101",
  "descricao": "Vista para o jardim",
  "limite_hospedes": 2,
  "camas": [{ "tipo": "casal", "quantidade": 1 }]
}
```

`identificacao` must match `^\\d+$`. `descricao` is optional. New rooms default to active status.

## `PUT /quartos/:id`

The request uses the same editable fields as creation and may include `status: "S" | "N"`. The response is the updated room, including category, beds, description and status.

Possible errors: `401` unauthenticated, `404` room/category not found or inactive category selected, `409` duplicate identification.

There is intentionally no `DELETE /quartos/:id` contract. Inactivation is represented by `status: "N"` in the update request.
