# Contract: POST /auth/login — Response Body

**Endpoint**: `POST /auth/login`
**Change type**: Behavioral update to existing field (no shape change)

---

## Response Shape (unchanged)

```
200 OK
{
  user: {
    id:            string   // UUID
    nome_completo: string   // Full registered name
    email:         string   // Email address
    hotel_id:      string   // UUID of the user's hotel
  },
  hotel: {
    id:           string    // UUID
    nome_hotel:   string
    nome_fantasia: string
    cnpj:         string
  },
  message: string           // ← behavior changes (see below)
}
```

---

## `message` Field — Before vs After

| State  | Value                          |
|--------|--------------------------------|
| Before | `"Bem-vindo!"`                 |
| After  | `"Seja bem-vindo, {first_name}!"` |

Where `{first_name}` is the first word of `user.nome_completo`, trimmed.

**Fallback**: If `nome_completo` is blank, `message` falls back to `"Bem-vindo!"`.

---

## Error Responses (unchanged)

```
401 Unauthorized
{ "message": "Credenciais inválidas" }

500 Internal Server Error
{ "message": "Erro interno do servidor" }
```

Error responses are unaffected by this feature.
