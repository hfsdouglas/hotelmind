import type {
  ParceiroComercial,
  StatusParceiro,
  TipoParceiro,
} from '@hotelmind/contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { ModalStatusParceiro } from '@/components/parceiros/modal_status_parceiro'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/usePaginacao'

const TIPO_LABELS: Record<TipoParceiro, string> = {
  agente_autonomo: 'Agente Autônomo',
  agencia_viagens: 'Agência de Viagens',
  operadora_turismo: 'Operadora de Turismo',
  clube_turismo: 'Clube de Turismo / Férias',
  empresa_corporativa: 'Empresa Corporativa',
}

function getStatusBadge(status: StatusParceiro) {
  switch (status) {
    case 'ativo':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Ativo
        </Badge>
      )
    case 'inativo':
      return (
        <Badge
          variant="outline"
          className="bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Inativo
        </Badge>
      )
    case 'bloqueado':
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Bloqueado
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ParceirosComerciaisPage() {
  usePageTitle('Parceiros Comerciais')
  const queryClient = useQueryClient()
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()
  const [searchParams] = useSearchParams()

  const tipoFiltro = searchParams.get('tipo_parceiro') || 'todos'
  const statusFiltro = searchParams.get('status') || 'todos'

  const [parceiroStatusModal, setParceiroStatusModal] =
    useState<ParceiroComercial | null>(null)

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      motivo,
    }: {
      id: string
      status: StatusParceiro
      motivo?: string | null
    }) =>
      parceirosComerciaisService.updateStatus(id, {
        status,
        motivo_bloqueio: motivo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros_comerciais'] })
      toast.success('Status do parceiro atualizado com sucesso!')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err.response?.data?.message || 'Erro ao atualizar status do parceiro.'
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => parceirosComerciaisService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros_comerciais'] })
      toast.success('Parceiro comercial excluído com sucesso!')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err.response?.data?.message || 'Erro ao excluir parceiro comercial.'
      )
    },
  })

  function handleDelete(p: ParceiroComercial) {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o parceiro "${p.razao_social}"?`
      )
    ) {
      deleteMutation.mutate(p.id)
    }
  }

  const columns: Column<ParceiroComercial>[] = [
    {
      key: 'parceiro',
      header: 'Parceiro',
      render: p => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-sm text-foreground">
            {p.razao_social}
          </div>
          {p.nome_fantasia && (
            <div className="text-xs text-muted-foreground">
              {p.nome_fantasia}
            </div>
          )}
          <div className="text-xs text-primary font-medium flex items-center gap-1">
            <span>{TIPO_LABELS[p.tipo_parceiro]}</span>
            <span className="text-muted-foreground">({p.tipo_pessoa})</span>
          </div>
        </div>
      ),
    },
    {
      key: 'documento',
      header: 'Documento / Órgãos',
      render: p => (
        <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
          <span>{p.documento || (p.estrangeiro ? 'Estrangeiro' : '-')}</span>
          {p.cadastur && <span>CADASTUR: {p.cadastur}</span>}
          {p.codigo_iata && <span>IATA: {p.codigo_iata}</span>}
        </div>
      ),
    },
    {
      key: 'localizacao',
      header: 'Localização',
      render: p => (
        <div className="text-xs text-muted-foreground">
          {p.cidade && p.estado ? `${p.cidade}/${p.estado}` : '-'}
        </div>
      ),
    },
    {
      key: 'modelo',
      header: 'Modelo / Comissão',
      render: p => (
        <div className="flex flex-col text-xs gap-0.5">
          <span className="capitalize font-medium text-foreground">
            {p.modelo_tarifario}
          </span>
          <span className="text-muted-foreground">
            {Number(p.comissao_padrao)}% de comissão
          </span>
        </div>
      ),
    },
    {
      key: 'faturamento',
      header: 'Faturamento / Limite',
      render: p => (
        <div className="flex flex-col text-xs gap-0.5">
          <span className="capitalize text-foreground">
            {p.politica_faturamento}
          </span>
          {Number(p.limite_credito) > 0 && (
            <span className="text-muted-foreground font-medium">
              Limite:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(p.limite_credito))}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: p => (
        <div className="flex flex-col gap-1 items-start">
          {getStatusBadge(p.status)}
          {p.motivo_bloqueio && (
            <span
              className="text-[11px] text-destructive max-w-xs truncate"
              title={p.motivo_bloqueio}
            >
              {p.motivo_bloqueio}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: p => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-700"
            title="Alterar Status"
            onClick={() => setParceiroStatusModal(p)}
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
            title="Editar Parceiro"
          >
            <Link to={`/comercial/parceiros/${p.id}/editar`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Excluir Parceiro"
            onClick={() => handleDelete(p)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Parceiros Comerciais"
      description="Gerencie o cadastro unificado de agências, operadoras, consultores, clubes e empresas B2B."
      action={
        <Button asChild className="gap-2">
          <Link to="/comercial/parceiros/novo">
            <Plus className="h-4 w-4" />
            Novo Parceiro
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={val => setParam('busca', val)}
          placeholder="Buscar por Razão Social, Nome Fantasia, CNPJ/CPF, CADASTUR..."
        />
      }
      filters={
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-56">
            <Select
              value={tipoFiltro}
              onValueChange={v =>
                setParam('tipo_parceiro', v === 'todos' ? '' : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Parceiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="agente_autonomo">Agente Autônomo</SelectItem>
                <SelectItem value="agencia_viagens">
                  Agência de Viagens
                </SelectItem>
                <SelectItem value="operadora_turismo">
                  Operadora de Turismo
                </SelectItem>
                <SelectItem value="clube_turismo">
                  Clube de Turismo / Férias
                </SelectItem>
                <SelectItem value="empresa_corporativa">
                  Empresa Corporativa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={statusFiltro}
              onValueChange={v => setParam('status', v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={[
          'parceiros_comerciais',
          {
            pagina,
            limite,
            busca,
            tipo_parceiro: tipoFiltro,
            status: statusFiltro,
          },
        ]}
        queryFn={() =>
          parceirosComerciaisService.list({
            pagina,
            limite,
            busca: busca.trim() || undefined,
            tipo_parceiro:
              tipoFiltro !== 'todos' ? (tipoFiltro as TipoParceiro) : undefined,
            status:
              statusFiltro !== 'todos'
                ? (statusFiltro as StatusParceiro)
                : undefined,
          })
        }
        label="Resultados de parceiros comerciais"
        emptyMessage="Nenhum parceiro comercial encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={v => setParam('limite', v)}
      />

      {parceiroStatusModal && (
        <ModalStatusParceiro
          isOpen={Boolean(parceiroStatusModal)}
          onClose={() => setParceiroStatusModal(null)}
          parceiro={parceiroStatusModal}
          isSubmitting={statusMutation.isPending}
          onConfirm={(status, motivo) => {
            statusMutation.mutate({
              id: parceiroStatusModal.id,
              status,
              motivo,
            })
            setParceiroStatusModal(null)
          }}
        />
      )}
    </ListPageLayout>
  )
}
