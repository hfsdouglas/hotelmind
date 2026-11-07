# Quickstart Validation Guide: Configurações do Hotel

**Feature**: Configurações > Hotel (Aplicação Web)
**Branch**: `028-hotel-settings`
**Date**: 2026-11-06

Este guia descreve os cenários executáveis para validar o funcionamento ponta a ponta da funcionalidade de configurações do hotel.

---

## 1. Pré-requisitos & Ambiente

- Node.js instalado e dependências sincronizadas: `pnpm install`
- Banco PostgreSQL operacional (ou container local) com Prisma gerado:
  ```bash
  pnpm --filter api db:generate
  pnpm --filter api db:migrate
  pnpm --filter api db:seed:routes
  ```

---

## 2. Cenários de Validação da API (Backend)

### Cenário 1: Execução dos Testes Automatizados da API

Executar os testes unitários de entidade, repositório em memória, casos de uso e integração Fastify:

```bash
pnpm --filter api test src/core/entities/hotel_configuracao.spec.ts
pnpm --filter api test src/core/usecases/hotels/
pnpm --filter api test src/routes/hotels/web/
```

**Resultado esperado**: Todos os testes passam com status verde (100% de sucesso).

### Cenário 2: Consulta de Configurações (`GET /hoteis/configuracao`)

- **Autenticação**: Enviar cookie ou header de autenticação do usuário logado na aplicação web.
- **Requisição**: `GET /hoteis/configuracao`
- **Resultado esperado**: Status `200 OK`, retornando o payload completo com os 5 módulos parametrizados (valores persistidos ou defaults seguros do hotel ativo).

### Cenário 3: Atualização de Configurações (`PUT /hoteis/configuracao`)

- **Requisição**: `PUT /hoteis/configuracao` com payload válido contendo alterações de tema, faixas de crianças e regras da casa.
- **Resultado esperado**: Status `200 OK`, retornando o payload atualizado e sincronizando o `nome_fantasia`, `razao_social` e `cnpj` na entidade `Hotel`.

---

## 3. Cenários de Validação do Frontend (Aplicação Web)

### Cenário 4: Execução dos Testes Automatizados do Frontend

Executar os testes unitários e de integração de componentes com MSW:

```bash
pnpm --filter web test src/components/hotel-configuracao/
pnpm --filter web test src/pages/app/configuracoes/hotel/
```

**Resultado esperado**: Testes de renderização de abas, formulários, preview em tempo real e simulações de salvar/descartar passam com sucesso.

### Cenário 5: Validação Visual e Interativa no Navegador

1. Iniciar os serviços de desenvolvimento:
   ```bash
   pnpm --filter api dev
   pnpm --filter web dev
   ```
2. Fazer login na aplicação web (`http://localhost:5173/login`).
3. No menu lateral, navegar até `Configurações > Hotel` (`/configuracoes/hotel`).
4. **Verificar Aba 1 (Identidade Visual & Tema)**:
   - Alterar as cores no seletor visual e verificar que o **Preview em Tempo Real** no card lateral reflete instantaneamente as novas cores (sub-100ms).
5. **Verificar Abas 2, 3, 4 e 5**:
   - Alternar entre abas, modificar campos de regras de crianças, horários operacionais e Wi-Fi.
   - Retornar à Aba 1 e constatar que todas as alterações permanecem preservadas em tela sem perdas.
6. **Verificar Ação de Descarte**:
   - Clicar no botão "Descartar alterações" na barra inferior fixa.
   - Confirmar que todos os formulários de todas as abas retornam aos valores originais salvos.
7. **Verificar Ação de Salvamento**:
   - Fazer alterações e clicar em "Salvar alterações".
   - Confirmar o feedback visual via Toast de sucesso e persistência dos dados ao recarregar a página.
