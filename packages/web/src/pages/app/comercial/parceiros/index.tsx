import type {
  ParceiroComercial,
  StatusParceiro,
  TipoParceiro,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building2,
  Edit,
  Handshake,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ModalStatusParceiro } from './components/modal_status_parceiro'

const TIPO_LABELS: Record<TipoParceiro, string> = {
  agente_autonomo: 'Agente Autônomo',
  agencia_viagens: 'Agência de Viagens',
  operadora_turismo: 'Operadora de Turismo',
  clube_turismo: 'Clube de Turismo / Férias',
  empresa_corporativa: 'Empresa Corporativa',
}

export function ParceirosComerciaisPage() {
  const queryClient = useQueryClient()
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')

  const [parceiroStatusModal, setParceiroStatusModal] =
    useState<ParceiroComercial | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['parceiros_comerciais', pagina, busca, tipoFiltro, statusFiltro],
    queryFn: () =>
      parceirosComerciaisService.list({
        pagina,
        limite: 15,
        busca: busca.trim() || undefined,
        tipo_parceiro:
          tipoFiltro !== 'todos' ? (tipoFiltro as TipoParceiro) : undefined,
        status:
          statusFiltro !== 'todos'
            ? (statusFiltro as StatusParceiro)
            : undefined,
      }),
  })

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" />
            Parceiros Comerciais
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro unificado de agências, operadoras, consultores,
            clubes e empresas B2B.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/comercial/parceiros/novo">
            <Plus className="h-4 w-4" />
            Novo Parceiro
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Filtros e Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Razão Social, Nome Fantasia, CNPJ/CPF, CADASTUR..."
              value={busca}
              onChange={e => {
                setBusca(e.target.value)
                setPagina(1)
              }}
              className="pl-9"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={tipoFiltro}
              onValueChange={v => {
                setTipoFiltro(v)
                setPagina(1)
              }}
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
              onValueChange={v => {
                setStatusFiltro(v)
                setPagina(1)
              }}
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
        </CardContent>
      </Card>

      {/* Tabela de Parceiros */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>Erro ao carregar parceiros comerciais.</p>
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Documento / Órgãos</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Modelo / Comissão</TableHead>
                    <TableHead>Faturamento / Limite</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {p.razao_social}
                          </span>
                          {p.nome_fantasia && (
                            <span className="text-xs text-muted-foreground">
                              {p.nome_fantasia}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="w-fit text-xs mt-0.5"
                          >
                            {TIPO_LABELS[p.tipo_parceiro] || p.tipo_parceiro}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs gap-0.5">
                          <span className="font-mono">
                            {p.documento ||
                              (p.estrangeiro ? 'Estrangeiro' : '—')}
                          </span>
                          {p.cadastur && (
                            <span className="text-muted-foreground">
                              CADASTUR: {p.cadastur}
                            </span>
                          )}
                          {p.codigo_iata && (
                            <span className="text-muted-foreground">
                              IATA: {p.codigo_iata}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm">
                        {p.cidade && p.estado
                          ? `${p.cidade}/${p.estado}`
                          : p.pais || '—'}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs gap-0.5">
                          <span className="capitalize font-medium">
                            {p.modelo_tarifario}
                          </span>
                          <span className="text-muted-foreground">
                            Comissão: {p.comissao_padrao}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs gap-0.5">
                          <span className="capitalize font-medium">
                            {p.politica_faturamento}
                          </span>
                          {p.politica_faturamento === 'faturado' && (
                            <span className="text-muted-foreground">
                              Lim: R$ {p.limite_credito} (
                              {p.prazo_pagamento_dias}d)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {p.status === 'ativo' ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Ativo
                          </Badge>
                        ) : p.status === 'inativo' ? (
                          <Badge variant="secondary">Inativo</Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="gap-1 cursor-pointer"
                            title={p.motivo_bloqueio || 'Bloqueado'}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Bloqueado
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Alterar Status"
                            onClick={() => setParceiroStatusModal(p)}
                          >
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Editar"
                          >
                            <Link to={`/comercial/parceiros/${p.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            title="Excluir"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mb-3 text-muted-foreground/50" />
              <p className="font-medium text-base">
                Nenhum parceiro encontrado
              </p>
              <p className="text-sm mt-1">
                Tente ajustar os filtros ou clique em "Novo Parceiro" para
                cadastrar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {data && data.meta.ultima_pagina > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total: {data.meta.total} parceiros</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => setPagina(p => p - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-2">
              Página {pagina} de {data.meta.ultima_pagina}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina >= data.meta.ultima_pagina}
              onClick={() => setPagina(p => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Status */}
      <ModalStatusParceiro
        parceiro={parceiroStatusModal}
        open={Boolean(parceiroStatusModal)}
        onOpenChange={open => !open && setParceiroStatusModal(null)}
        onConfirm={async (status, motivo) => {
          if (parceiroStatusModal) {
            await statusMutation.mutateAsync({
              id: parceiroStatusModal.id,
              status,
              motivo,
            })
          }
        }}
        isPending={statusMutation.isPending}
      />
    </div>
  )
}
