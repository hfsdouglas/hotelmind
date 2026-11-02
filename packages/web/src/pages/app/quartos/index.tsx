import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable, type Column } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { quartosService } from '@/api/quartos.service'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import type { Quarto } from '@hotelmind/contracts'
import { SearchResultsSuspense } from '@/components/data-table/search_results_suspense'

function format_bed_type(type: string) {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function QuartosPage() {
  const { pagina, limite, busca, setParam, setPagina, isPending } = usePaginacao()
  const [searchParams] = useSearchParams()
  const categoria_ids = (searchParams.get('categoria_id') ?? '').split(',').filter(Boolean)
  const status = searchParams.get('status') as 'S' | 'N' | null
  const { data: categories } = useQuery({ queryKey: ['categorias_quartos', 'all'], queryFn: () => categoriasQuartosService.list({ limite: 250 }) })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Quartos</h1><Button asChild><Link to="/quartos/novo"><Plus className="mr-2 h-4 w-4" />Novo quarto</Link></Button></div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3"><SearchBar value={busca} onSearch={value => setParam('busca', value)} placeholder="Pesquisar por quarto, categoria ou cama..." /><Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="shrink-0"><Filter className="mr-2 h-4 w-4" />Mais filtros</Button></PopoverTrigger><PopoverContent><div className="flex max-h-[min(28rem,70vh)] flex-col gap-4 overflow-y-auto"><div className="flex flex-col gap-1.5"><Label>Status</Label><Select value={status ?? 'all'} onValueChange={value => setParam('status', value === 'all' ? '' : value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="S">Ativos</SelectItem><SelectItem value="N">Inativos</SelectItem></SelectContent></Select></div><div className="flex flex-col gap-2"><Label>Categorias</Label><div className="flex flex-col gap-2">{categories?.data.map(category => <label key={category.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={categoria_ids.includes(category.id)} onCheckedChange={checked => { const next = checked ? [...categoria_ids, category.id] : categoria_ids.filter(id => id !== category.id); setParam('categoria_id', next.join(',')) }} /><span>{category.nome}</span></label>)}</div>{categoria_ids.length > 0 && <Button type="button" variant="ghost" size="sm" className="self-start px-0" onClick={() => setParam('categoria_id', '')}>Limpar categorias</Button>}</div></div></PopoverContent></Popover></div>
      </div>
      <SearchResultsSuspense column_count={6} column_labels={['Quarto', 'Categoria', 'Limite de hóspedes', 'Camas', 'Status', '']} error_message="Não foi possível carregar os quartos." is_pending={isPending} label="Resultados de quartos" reset_key={`${pagina}-${limite}-${busca}-${categoria_ids.join(',')}-${status ?? ''}`} row_count={limite}>
        <QuartosResults categoria_ids={categoria_ids} busca={busca} limite={limite} onLimite={value => setParam('limite', value)} onPagina={setPagina} pagina={pagina} status={status} />
      </SearchResultsSuspense>
    </div>
  )
}

interface QuartosResultsProps {
  busca: string
  categoria_ids: string[]
  limite: number
  onLimite: (value: number) => void
  onPagina: (value: number) => void
  pagina: number
  status: 'S' | 'N' | null
}

function QuartosResults({ categoria_ids, busca, limite, onLimite, onPagina, pagina, status }: QuartosResultsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['quartos', { pagina, limite, busca, categoria_ids, status }],
    queryFn: () => quartosService.list({ pagina, limite, busca: busca || undefined, categoria_id: categoria_ids.length ? categoria_ids.join(',') : undefined, status: status ?? undefined }),
  })
  const columns: Column<Quarto>[] = [
    { key: 'identificacao', header: 'Quarto' },
    { key: 'categoria', header: 'Categoria', render: row => row.categoria.nome },
    { key: 'limite_hospedes', header: 'Limite de hóspedes' },
    { key: 'camas', header: 'Camas', render: row => row.camas.map(bed => `${bed.quantidade}x ${format_bed_type(bed.tipo)}`).join(', ') },
    { key: 'status', header: 'Status', render: row => <Badge variant={row.status === 'S' ? 'success' : 'secondary'}>{row.status === 'S' ? 'Ativo' : 'Inativo'}</Badge> },
    { key: 'acoes', header: '', render: row => <div className="flex justify-end"><Button variant="ghost" size="icon" asChild title="Editar quarto" aria-label={`Editar quarto ${row.identificacao}`}><Link to={`/quartos/${row.id}/editar`}><Pencil className="h-4 w-4" /></Link></Button></div> },
  ]

  return <><ResultCount total={data.meta.total} /><DataTable columns={columns} data={data.data} emptyMessage="Nenhum quarto encontrado." /><DataTablePagination pagina={pagina} limite={limite} ultima_pagina={data.meta.ultima_pagina} onPageChange={onPagina} onLimitChange={onLimite} /></>
}
