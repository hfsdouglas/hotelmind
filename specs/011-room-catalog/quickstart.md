# Quickstart: Validar Cadastro de Categorias e Quartos

## Pré-requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- PostgreSQL configurado para `packages/api/.env`
- Dependências instaladas na raiz com `pnpm install`

## Validação automatizada

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter web build
```

Antes dos testes que dependem do banco:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

## Cenário manual de aceite

1. Inicie a API e a aplicação web com os comandos de desenvolvimento já usados pelo projeto.
2. Autentique um usuário autorizado do hotel.
3. Abra categorias e crie uma categoria com nome válido; confirme que ela aparece na listagem.
4. Abra quartos e confirme que a categoria recém-criada está disponível.
5. Crie um quarto informando identificação, limite positivo de hóspedes e uma ou mais camas com quantidades positivas.
6. Confirme que o quarto aparece associado à categoria e exibe todas as camas e o limite informado.
7. Repita o nome da categoria e a identificação do quarto; confirme as mensagens de conflito.
8. Tente salvar o quarto sem categoria, sem camas, com quantidade inválida e com limite inválido; confirme que o cadastro é bloqueado.
9. Simule uma falha de salvamento e confirme que nenhum quarto parcial aparece na listagem.

Os formatos completos estão em [contratos de categorias](./contracts/categorias_quartos.md) e [contratos de quartos](./contracts/quartos.md). As relações e invariantes estão em [data-model.md](./data-model.md).
