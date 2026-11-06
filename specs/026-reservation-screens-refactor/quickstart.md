# Quickstart: Validação da Refatoração das Telas de Reservas

**Feature**: Refatoração das Telas de Reservas
**Directory**: `specs/026-reservation-screens-refactor`
**Date**: 2026-11-05

## 1. Pré-Requisitos

1. Node.js v26+ e npm instalados e disponíveis no ambiente.
2. Dependências do monorepo instaladas (`npm install`).

---

## 2. Roteiro de Validação Automatizada

Para rodar os testes unitários e de renderização das telas de reservas:

```bash
export PATH="/home/douglas/.nvm/versions/node/v26.13.0/bin:$PATH"
npm --prefix packages/web test -- src/pages/app/reservas/
```

### Resultados Esperados
- Todos os testes de renderização de `nova.spec.tsx` devem passar com 100% de sucesso.
- Todos os testes de renderização de `reservas_pages.spec.tsx` e `index.spec.tsx` devem passar com 100% de sucesso.
- Nenhuma falha de snapshot ou quebra de seletores de formulário.

---

## 3. Roteiro de Validação Visual Interativa

### Cenário 1: Consulta de Reservas (`/reservas`)
1. Inicie a aplicação web:
   ```bash
   npm --prefix packages/web run dev
   ```
2. Acesse a rota `/reservas` no navegador.
3. **Verificação de Alinhamento**:
   - Observe a barra de ferramentas superior com a busca e os filtros.
   - Verifique que os campos de seleção de Status e Parceiro Comercial têm a mesma altura (`h-9`), borda e alinhamento vertical da `SearchBar`.
   - Passe o cursor sobre o botão de ação rápida de visualização na tabela: confirme dimensões quadradas uniformes (`h-8 w-8`) e efeito de hover semântico.

### Cenário 2: Nova Reserva (`/reservas/nova`)
1. Clique no botão **Nova Reserva** a partir de `/reservas` (ou acesse diretamente `/reservas/nova`).
2. **Passo 1 (Período e Ocupantes)**:
   - Verifique a presença de ícones contextuais dentro dos campos numéricos e datas.
   - Selecione check-in e check-out (ex: amanhã até 3 dias depois).
   - Confirme a aparição instantânea do banner de confirmação de período com o número de diárias calculadas.
3. **Passo 2 (Regimes)**:
   - Verifique os cards de regimes de alimentação: bordas suaves, anel de foco temático ao selecionar, indicador de cor da pulseira com borda delimitadora.
4. **Passo 3 (Suítes Disponíveis)**:
   - Selecione um regime para disparar a busca de disponibilidade.
   - Verifique os cards de suítes disponíveis com tipografia semântica e valores alinhados no rodapé do card.
   - Ao selecionar uma suíte, confira o card de resumo do valor total destacado.
5. **Passo 4 (Titular e Parceiro)**:
   - Verifique os ícones à esquerda nos campos de Nome, Telefone e E-mail.
   - Teste a digitação no telefone: verifique aplicação fluida da máscara `(00) 00000-0000`.
   - Verifique o alinhamento em duas colunas entre o seletor estilizado de Parceiro e o campo de Observações.
6. **Alternância de Tema Claro / Escuro**:
   - Alterne o tema e confirme legibilidade total sem quebras de contraste ou cores hardcoded fora do tema.
