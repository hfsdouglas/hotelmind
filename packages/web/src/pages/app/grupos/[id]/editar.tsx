import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckboxGrid } from '@/components/forms/CheckboxGrid'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { gruposService } from '@/api/grupos.service'
import type { RotaItem } from '@/api/grupos.service'

const schema = z.object({
  grupo: z.string().min(1, 'Nome obrigatório').max(100),
  descricao: z.string().optional(),
  status: z.enum(['S', 'N']),
})

type FormData = z.infer<typeof schema>

function groupByModule(rotas: RotaItem[]): Record<string, RotaItem[]> {
  return rotas.reduce(
    (acc, r) => {
      if (!acc[r.modulo]) acc[r.modulo] = []
      acc[r.modulo].push(r)
      return acc
    },
    {} as Record<string, RotaItem[]>,
  )
}

export function EditarGrupoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: grupo, isLoading } = useQuery({
    queryKey: ['grupos', id],
    queryFn: () => gruposService.get(id!),
    enabled: !!id,
  })

  const { data: allRotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: () =>
      import('@/lib/axios').then(({ api }) =>
        api.get<RotaItem[]>('/rotas').then(r => r.data),
      ),
  })

  const { data: grupoRotas } = useQuery({
    queryKey: ['grupos', id, 'rotas'],
    queryFn: () => gruposService.listRotas(id!),
    enabled: !!id,
  })

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (grupoRotas) {
      setSelectedIds(new Set(grupoRotas.map(r => r.id)))
    }
  }, [grupoRotas])

  const { register, handleSubmit, setValue, formState: { errors }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (grupo) {
      reset({
        grupo: grupo.grupo,
        descricao: grupo.descricao ?? '',
        status: grupo.status as 'S' | 'N',
      })
    }
  }, [grupo, reset])

  const syncRotasMutation = useMutation({
    mutationFn: (rota_ids: string[]) => gruposService.syncRotas(id!, rota_ids),
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => gruposService.update(id!, data),
    onSuccess: () => {
      syncRotasMutation.mutate(Array.from(selectedIds), {
        onSuccess: () => {
          toast.success('Grupo atualizado.')
          queryClient.invalidateQueries({ queryKey: ['grupos'] })
          queryClient.invalidateQueries({ queryKey: ['grupos', id, 'rotas'] })
          navigate('/grupos')
        },
        onError: () => toast.error('Erro ao sincronizar rotas.'),
      })
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um grupo com este nome.')
      } else {
        toast.error('Erro ao atualizar grupo.')
      }
    },
  })

  function toggleRota(rotaId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(rotaId)) {
        next.delete(rotaId)
      } else {
        next.add(rotaId)
      }
      return next
    })
  }

  const modules = groupByModule(allRotas)

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!grupo) return <p className="text-destructive">Grupo não encontrado.</p>

  return (
    <CrudFormLayout
      title="Editar grupo"
      backTo="/grupos"
      cardTitle="Dados do grupo"
      onSubmit={handleSubmit(d => updateMutation.mutate(d))}
      actions={
        <Button
          type="submit"
          disabled={updateMutation.isPending || syncRotasMutation.isPending}
        >
          {updateMutation.isPending || syncRotasMutation.isPending
            ? 'Salvando...'
            : 'Salvar'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo">Nome *</Label>
          <Input id="grupo" {...register('grupo')} />
          {errors.grupo && (
            <p className="text-sm text-destructive">{errors.grupo.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" {...register('descricao')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select
            value={grupo.status}
            onValueChange={v => setValue('status', v as 'S' | 'N')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">Ativo</SelectItem>
              <SelectItem value="N">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-base font-semibold mb-4">Rotas de acesso</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(modules).map(([modulo, rotas]) => (
            <div key={modulo}>
              <p className="font-medium mb-2">{modulo}</p>
              <CheckboxGrid
                items={rotas.map(r => ({ id: r.id, label: r.recurso }))}
                selectedIds={selectedIds}
                onToggle={toggleRota}
                disabled={updateMutation.isPending || syncRotasMutation.isPending}
              />
            </div>
          ))}
          {allRotas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma rota disponível.</p>
          )}
        </div>
      </div>
    </CrudFormLayout>
  )
}
