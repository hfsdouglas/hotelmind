import type { Tarifario } from '@hotelmind/contracts'
import { useQuery } from '@tanstack/react-query'
import { Ban, CheckCircle2, Eye, Filter, Pencil, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { tarifariosService } from '@/api/tarifarios.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { TarifarioStatusBadge } from '@/components/tarifarios/tarifario_status_badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useActivateTarifarioMutation,
  useDeactivateTarifarioMutation,
} from '@/hooks/use_tarifarios'
import { usePaginacao } from '@/hooks/usePaginacao'
import {
  format_dates_summary,
  format_iso_to_br,
} from '@/schemas/tarifario.schema'

export function TarifariosPage() {
  const { pagina, limite, busca, setParam, setPagina, isPending } =
    usePaginacao()
  const [searchParams] = useSearchParams()
  const categoria_quarto_id = searchParams.get('categoria_quarto_id') ?? ''
  const ativo_param = searchParams.get('ativo')
  const ativo_filter =
    ativo_param === 'true' ? true : ativo_param === 'false' ? false : undefined

  const [viewing_tarifario, setViewingTarifario] = useState<Tarifario | null>(
    null,
  )
  const [deactivating_tarifario, setDeactivatingTarifario] =
    useState<Tarifario | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categorias_quartos', 'all'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })

  const activate_mutation = useActivateTarifarioMutation()
  const deactivate_mutation = useDeactivateTarifarioMutation()

  function handle_activate(row: Tarifario) {
    activate_mutation.mutate(row.id, {
      onSuccess: () => toast.success(`Tarifário "${row.nome}" ativado.`),
      onError: (
        error: Error & {
          response?: { status?: number; data?: { message?: string } }
        },
      ) => {
        if (error.response?.status === 409) {
          toast.error(
            error.response.data?.message ??
              'Não é possível reativar: conflito de data com outro tarifário ativo.',
          )
        } else {
          toast.error('Erro ao ativar tarifário.')
        }
      },
    })
  }

  function handle_confirm_deactivate() {
    if (!deactivating_tarifario) return
    deactivate_mutation.mutate(deactivating_tarifario.id, {
      onSuccess: () => {
        toast.success(`Tarifário "${deactivating_tarifario.nome}" desativado.`)
        setDeactivatingTarifario(null)
      },
      onError: () => {
        toast.error('Erro ao desativar tarifário.')
        setDeactivatingTarifario(null)
      },
    })
  }

  const columns: Column<Tarifario>[] = [
    { key: 'nome', header: 'Nome do tarifário' },
    {
      key: 'categoria_quarto',
      header: 'Categoria de quarto',
      render: row => row.categoria_quarto.nome,
    },
    {
      key: 'datas',
      header: 'Datas selecionadas',
      render: row => (
        <span title={row.datas.map(format_iso_to_br).join(', ')}>
          {format_dates_summary(row.datas, 3)}
        </span>
      ),
    },
    {
      key: 'valor_diaria',
      header: 'Valor da diária',
      render: row => `R$ ${row.valor_diaria}`,
    },
    {
      key: 'ativo',
      header: 'Situação',
      render: row => <TarifarioStatusBadge ativo={row.ativo} />,
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Visualizar tarifário"
            aria-label={`Visualizar tarifário ${row.nome}`}
            onClick={() => setViewingTarifario(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Editar tarifário"
            aria-label={`Editar tarifário ${row.nome}`}
          >
            <Link to={`/tarifarios/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          {row.ativo ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Desativar tarifário"
              aria-label={`Desativar tarifário ${row.nome}`}
              onClick={() => setDeactivatingTarifario(row)}
            >
              <Ban className="h-4 w-4 text-destructive" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Ativar tarifário"
              aria-label={`Ativar tarifário ${row.nome}`}
              onClick={() => handle_activate(row)}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <ListPageLayout
        title="Tarifários"
        action={
          <Button asChild>
            <Link to="/tarifarios/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo tarifário
            </Link>
          </Button>
        }
        searchBar={
          <SearchBar
            value={busca}
            onSearch={value => setParam('busca', value)}
            placeholder="Pesquisar por nome ou categoria..."
          />
        }
        filters={
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                data-testid="more-filters-trigger"
                className="shrink-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Mais filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent
              data-testid="more-filters-content"
              className="min-w-[280px] sm:min-w-[320px]"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="filtro-situacao">Situação</Label>
                  <Select
                    value={ativo_param ?? 'all'}
                    onValueChange={value =>
                      setParam('ativo', value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger
                      id="filtro-situacao"
                      aria-label="Filtrar por situação"
                    >
                      <SelectValue placeholder="Todas as situações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as situações</SelectItem>
                      <SelectItem value="true">Ativos</SelectItem>
                      <SelectItem value="false">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="filtro-categoria">Categoria de quarto</Label>
                  <Select
                    value={categoria_quarto_id || 'all'}
                    onValueChange={value =>
                      setParam(
                        'categoria_quarto_id',
                        value === 'all' ? '' : value,
                      )
                    }
                  >
                    <SelectTrigger
                      id="filtro-categoria"
                      aria-label="Filtrar por categoria"
                    >
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories?.data.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(categoria_quarto_id || ativo_param) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="clear-more-filters"
                    className="h-7 self-start px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setParam('categoria_quarto_id', '')
                      setParam('ativo', '')
                    }}
                  >
                    Limpar filtros
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        }
      >
        <PagedDataTable
          columns={columns}
          queryKey={[
            'tarifarios',
            {
              pagina,
              limite,
              busca,
              categoria_quarto_id,
              ativo: ativo_filter,
            },
          ]}
          queryFn={() =>
            tarifariosService.list({
              pagina,
              limite,
              busca: busca || undefined,
              categoria_quarto_id: categoria_quarto_id || undefined,
              ativo: ativo_filter,
            })
          }
          label="Resultados de tarifários"
          errorMessage="Não foi possível carregar os tarifários."
          emptyMessage="Nenhum tarifário encontrado."
          isPending={isPending}
          pagina={pagina}
          limite={limite}
          onPageChange={setPagina}
          onLimitChange={value => setParam('limite', value)}
        />
      </ListPageLayout>

      <AlertDialog
        open={Boolean(viewing_tarifario)}
        onOpenChange={open => {
          if (!open) setViewingTarifario(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{viewing_tarifario?.nome}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 pt-2 text-sm text-foreground">
                <div>
                  <span className="font-semibold">Categoria de quarto: </span>
                  <span>{viewing_tarifario?.categoria_quarto.nome}</span>
                </div>
                <div>
                  <span className="font-semibold">Datas selecionadas: </span>
                  <span>
                    {viewing_tarifario
                      ? viewing_tarifario.datas.map(format_iso_to_br).join(', ')
                      : ''}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Valor da diária: </span>
                  <span>R$ {viewing_tarifario?.valor_diaria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Situação: </span>
                  {viewing_tarifario && (
                    <TarifarioStatusBadge ativo={viewing_tarifario.ativo} />
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            {viewing_tarifario && (
              <AlertDialogAction asChild>
                <Link to={`/tarifarios/${viewing_tarifario.id}/editar`}>
                  Editar tarifário
                </Link>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deactivating_tarifario)}
        onOpenChange={open => {
          if (!open) setDeactivatingTarifario(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar tarifário?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma a desativação do tarifário "{deactivating_tarifario?.nome}
              "? Seus dados serão preservados para histórico, mas ele não será
              utilizado no cálculo de novas reservas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handle_confirm_deactivate}>
              Confirmar desativação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
