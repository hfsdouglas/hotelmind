# Quickstart Validation Guide: Seleção Multi-Categoria e Estadia Mínima

## Cenários de Teste e Validação Ponta a Ponta

### 1. Cadastro de Tarifário com Múltiplas Categorias e Estadia Mínima
1. Acessar `/tarifarios/novo`.
2. **Passo 1 (Dados Básicos)**: Preencher Nome (`"Fim de Semana Especial"`) e selecionar um Regime de Alimentação ativo.
3. **Passo 2 (Categorias de Quarto)**: Verificar que as categorias ativas aparecem em cards visuais padronizados com capacidade. Clicar em 2 categorias (ex.: Standard e Luxo).
4. **Passo 3 (Parceiro Comercial)**: Manter "Reserva Direta".
5. **Passo 4 (Calendário de Datas)**: Selecionar sexta-feira, sábado e domingo.
6. **Passo 5 (Valores e Estadia)**:
   - Digitar `25000` no campo de valor e verificar a máscara `R$ 250,00`.
   - Inserir `2` no campo de quantidade mínima de diárias.
7. Clicar em "Salvar".
8. Verificar que o tarifário é salvo com sucesso e listado na tabela exibindo as categorias vinculadas.

### 2. Validação da Regra de Estadia Mínima no Orçamento
1. Acessar `/reservas/orcamentos/novo`.
2. Informar período de apenas 1 diária (ex.: sexta-feira para sábado) nas mesmas datas do tarifário criado.
3. Selecionar o regime de alimentação.
4. **Passo 4 (Acomodação)**: As categorias configuradas com mínimo de 2 diárias devem indicar que a estadia mínima não foi atendida e não permitir seleção.
5. Alterar o período para 2 diárias (sexta a domingo).
6. As suítes das categorias selecionadas devem ficar disponíveis e calculadas com o valor correspondente.
