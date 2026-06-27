# Sistema de Gestão Hoteleira

Sistema de gestão hoteleira construído como um monorepo com arquitetura de microsserviços.

## Visão Geral

Este projeto tem como objetivo centralizar e simplificar as operações de um hotel, oferecendo uma API robusta e uma interface web moderna para gerenciar reservas, hóspedes, quartos e demais processos do dia a dia hoteleiro.

## Estrutura do Repositório

```
packages/
  .contracts/    # Interfaces e tipos TypeScript compartilhados
  api/           # Servidor HTTP / API backend (Fastify)
  web/           # Aplicação web front-end
```

## Tecnologias

- **Runtime:** Node.js
- **API:** Fastify, Prisma, PostgreSQL, Zod
- **Front-end:** (em definição)
- **Linguagem:** TypeScript
- **Gerenciador de pacotes:** pnpm (workspaces)
- **Linting e formatação:** Biome

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL

## Instalação

```bash
# Clonar o repositório
git clone git@github.com:hfsdouglas/hotelmind.git
cd hotelmind

# Instalar dependências
pnpm install
```

## Licença

Todos os direitos reservados.
