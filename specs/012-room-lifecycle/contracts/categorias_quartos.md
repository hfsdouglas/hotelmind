# Category Contracts

## `GET /categorias_quartos`

Query parameters remain `pagina`, `limite`, `busca`, `direcao` and optional `status=S|N`. The response keeps the paginated category shape.

The web list presents status as a direct select with `Todos`, `Ativos` and `Inativos`; it does not use the room-page “Mais filtros” overlay.

## `PUT /categorias_quartos/:id`

Request body:

```json
{ "nome": "Suítes Luxo", "status": "S" }
```

Response: the updated `CategoriaQuarto`.

Possible errors: `401` unauthenticated, `404` category does not belong to the authenticated hotel, `409` duplicate name.

There is intentionally no `DELETE /categorias_quartos/:id` contract. Inactivation is represented by `status: "N"` in the update request.
