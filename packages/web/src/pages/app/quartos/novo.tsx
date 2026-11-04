import { useState } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { quartosService } from '@/api/quartos.service'
import { TIPOS_CAMA, type TipoCama } from '@hotelmind/contracts'

type BedRow = { tipo: TipoCama | ''; quantidade: number | '' }
const initial_bed: BedRow = { tipo: '', quantidade: 1 }
const room_schema = z.object({ identificacao: z.string().trim().regex(/^\d+$/, 'A identificação deve conter apenas números.') })

function format_bed_type(type: string) {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function NovoQuartoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [categoria_id, setCategoriaId] = useState('')
  const [identificacao, setIdentificacao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [limite_hospedes, setLimiteHospedes] = useState<number | ''>('')
  const [camas, setCamas] = useState<BedRow[]>([initial_bed])
  const [errors, setErrors] = useState<string[]>([])
  const { data: categories } = useQuery({ queryKey: ['categorias_quartos', 'ativas'], queryFn: () => categoriasQuartosService.list({ status: 'S', limite: 250 }) })
  const mutation = useMutation({
    mutationFn: () => quartosService.create({ categoria_id, identificacao, descricao, limite_hospedes: Number(limite_hospedes), camas: camas.map(bed => ({ tipo: bed.tipo as TipoCama, quantidade: Number(bed.quantidade) })) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quartos'] }); toast.success('Quarto criado com sucesso.'); navigate('/quartos') },
    onError: (error: { response?: { status?: number } }) => toast.error(error.response?.status === 409 ? 'Já existe um quarto com esta identificação.' : 'Erro ao criar quarto.'),
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: string[] = []
    if (!categoria_id) next.push('Selecione uma categoria.')
    if (!identificacao.trim()) next.push('Informe a identificação do quarto.')
    else {
      const result = room_schema.safeParse({ identificacao })
      if (!result.success) next.push(result.error.issues[0]?.message ?? 'A identificação deve conter apenas números.')
    }
    if (!limite_hospedes || limite_hospedes < 1) next.push('Informe um limite positivo de hóspedes.')
    if (!camas.length || camas.some(bed => !bed.tipo || !bed.quantidade || bed.quantidade < 1)) next.push('Informe tipo e quantidade para todas as camas.')
    if (new Set(camas.map(bed => bed.tipo).filter(Boolean)).size !== camas.length) next.push('Cada tipo de cama deve aparecer uma vez.')
    setErrors(next)
    if (!next.length) mutation.mutate()
  }
  if (!categories) return <p>Carregando categorias...</p>
  if (!categories.data.length) return <div className="flex flex-col gap-6"><h1 className="text-2xl font-bold tracking-tight">Novo quarto</h1><Card><CardContent className="flex items-center justify-between gap-4 p-6"><p className="text-sm text-muted-foreground">Nenhuma categoria ativa foi cadastrada.</p><Button asChild className="w-auto shrink-0"><Link to="/categorias_quartos/novo">Criar categoria</Link></Button></CardContent></Card></div>

  return <CrudFormLayout title="Novo quarto" backTo="/quartos" cardTitle="Dados do quarto" onSubmit={submit} actions={<SaveButton isPending={mutation.isPending} />}>
    <div className="flex flex-col gap-4">
      {errors.map(error => <p key={error} className="text-sm text-destructive">{error}</p>)}
      <div className="flex flex-col gap-1.5"><Label htmlFor="categoria_id">Categoria *</Label><Select value={categoria_id || undefined} onValueChange={setCategoriaId}><SelectTrigger id="categoria_id"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{categories.data.map(category => <SelectItem key={category.id} value={category.id}>{category.nome}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="identificacao">Identificação *</Label><Input id="identificacao" value={identificacao} onChange={event => setIdentificacao(event.target.value)} /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="descricao">Descrição</Label><Textarea id="descricao" value={descricao} onChange={event => setDescricao(event.target.value)} /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="limite_hospedes">Limite de hóspedes *</Label><Input id="limite_hospedes" type="number" min="1" value={limite_hospedes} onChange={event => setLimiteHospedes(event.target.value ? Number(event.target.value) : '')} /></div>
      <div className="flex flex-col gap-3 border-t pt-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Configuração de camas</h2><Button type="button" variant="outline" onClick={() => setCamas(rows => [...rows, initial_bed])}>Adicionar cama</Button></div>{camas.map((bed, index) => <div className="flex items-end gap-3" key={`${index}-${bed.tipo}`}><div className="flex flex-1 flex-col gap-1.5"><Label htmlFor={`tipo-${index}`}>Tipo *</Label><Select value={bed.tipo || undefined} onValueChange={value => setCamas(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, tipo: value as TipoCama } : row))}><SelectTrigger id={`tipo-${index}`}><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPOS_CAMA.map(type => <SelectItem key={type} value={type}>{format_bed_type(type)}</SelectItem>)}</SelectContent></Select></div><div className="w-28 flex flex-col gap-1.5"><Label htmlFor={`quantidade-${index}`}>Quantidade *</Label><Input id={`quantidade-${index}`} type="number" min="1" value={bed.quantidade} onChange={event => setCamas(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, quantidade: event.target.value ? Number(event.target.value) : '' } : row))} /></div><Button type="button" variant="ghost" onClick={() => setCamas(rows => rows.filter((_, rowIndex) => rowIndex !== index))}>Remover</Button></div>)}</div>
    </div>
  </CrudFormLayout>
}
