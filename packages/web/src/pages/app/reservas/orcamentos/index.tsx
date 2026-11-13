import type { Orcamento } from '@hotelmind/contracts'
import type { Column } from '@hotelmind/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  ListPageLayout,
  SearchBar,
} from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { orcamentosService } from '@/api/orcamentos.service'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { OrcamentoAcoesCompartilhamento } from '@/components/orcamentos/orcamento_acoes_compartilhamento'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'
import { mask_phone } from '@/hooks/use_phone_mask'

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
  const dateOnly = dataIso.split('T')[0]
  const [ano, mes, dia] = dateOnly.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

export function OrcamentosPage() {
  usePageTitle('Orçamentos de Reserva')
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()
  const queryClient = useQueryClient()
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<Orcamento | null>(
    null
  )

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orcamentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      toast.success('Orçamento excluído com sucesso.')
      setOrcamentoToDelete(null)
    },
    onError: () => {
      toast.error('Erro ao excluir orçamento.')
    },
  })

  const columns: Column<Orcamento>[] = [
    {
      key: 'lead',
      header: 'Lead / Contato',
      render: row => (
        <div>
          <span className="font-semibold">{row.lead?.nome ?? 'Sem nome'}</span>
          <div className="text-xs text-muted-foreground">
            {mask_phone(row.lead?.telefone ?? '')}{' '}
            {row.lead?.email ? `• ${row.lead.email}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'periodo',
      header: 'Período',
      render: row => (
        <span className="text-xs">
          {formatarDataBR(row.check_in)} até {formatarDataBR(row.check_out)}
        </span>
      ),
    },
    {
      key: 'acomodacao',
      header: 'Acomodação',
      render: row => (
        <span className="text-xs font-medium">
          {row.categoria_quarto?.nome ?? 'Quarto'}
        </span>
      ),
    },
    {
      key: 'regime',
      header: 'Regime',
      render: row => (
        <div className="flex items-center gap-1.5">
          {row.regime_alimentacao?.cor_pulseira && (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: row.regime_alimentacao.cor_pulseira,
              }}
            />
          )}
          <span className="text-xs">
            {row.regime_alimentacao?.titulo ?? 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'ocupantes',
      header: 'Hóspedes',
      render: row => (
        <span className="text-xs text-muted-foreground">
          {row.quantidade_adultos} ad.
          {row.quantidade_criancas > 0
            ? ` • ${row.quantidade_criancas} cr.`
            : ''}
          {row.quantidade_pets > 0 ? ` • ${row.quantidade_pets} pet` : ''}
        </span>
      ),
    },
    {
      key: 'valor_total',
      header: 'Total',
      render: row => (
        <div>
          <span className="font-bold text-primary">
            {formatarMoeda(row.valor_total)}
          </span>
          {row.cupom_desconto && (
            <div className="text-[10px] text-muted-foreground uppercase font-medium">
              Cupom: {row.cupom_desconto}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => {
        const variants: Record<
          string,
          'default' | 'secondary' | 'destructive' | 'outline'
        > = {
          pendente: 'secondary',
          aprovado: 'default',
          cancelado: 'destructive',
          expirado: 'outline',
        }
        return (
          <Badge
            variant={variants[row.status] ?? 'secondary'}
            className="capitalize text-xs"
          >
            {row.status}
          </Badge>
        )
      },
    },
    {
      key: 'acoes',
      header: '',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <OrcamentoAcoesCompartilhamento
            token_publico={row.token_publico}
            lead_nome={row.lead?.nome}
            lead_email={row.lead?.email}
            lead_telefone={row.lead?.telefone}
            valor_total={row.valor_total}
            compact
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            asChild
            title="Editar orçamento"
          >
            <Link to={`/reservas/orcamentos/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Excluir orçamento"
            onClick={() => setOrcamentoToDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Orçamentos de Reserva"
      action={
        <Button asChild>
          <Link to="/reservas/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={val => setParam('busca', val)}
          placeholder="Buscar por nome do lead, telefone ou observações..."
        />
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['orcamentos', { pagina, limite, busca }]}
        queryFn={() =>
          orcamentosService.list({
            pagina,
            limite,
            busca: busca || undefined,
          })
        }
        label="Resultados de orçamentos"
        emptyMessage="Nenhum orçamento encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={v => setParam('limite', v)}
      />

      <AlertDialog
        open={Boolean(orcamentoToDelete)}
        onOpenChange={open => {
          if (!open) setOrcamentoToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a proposta comercial de{' '}
              <strong>{orcamentoToDelete?.lead?.nome}</strong>. O link público
              deixará de responder imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (orcamentoToDelete) {
                  deleteMutation.mutate(orcamentoToDelete.id)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListPageLayout>
  )
}
