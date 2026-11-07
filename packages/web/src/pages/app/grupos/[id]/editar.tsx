import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { RotaItem } from '@/api/grupos.service'
import { gruposService } from '@/api/grupos.service'
import { CheckboxGroupList } from '@/components/forms/CheckboxGroupList'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePageTitle } from '@/hooks/use_document_title'
import { type GrupoFormData, grupoSchema } from '@/schemas/grupos/grupo_schema'

type FormData = GrupoFormData

function groupByModule(rotas: RotaItem[]) {
  const modules = new Map<string, RotaItem[]>()
  for (const rota of rotas) {
    if (!modules.has(rota.modulo)) modules.set(rota.modulo, [])
    modules.get(rota.modulo)!.push(rota)
  }
  return Array.from(modules.entries()).map(([modulo, rotas]) => ({
    label: modulo,
    items: rotas.map(r => ({ id: r.id, label: r.recurso })),
  }))
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

  usePageTitle(grupo?.grupo ? `Editar Grupo - ${grupo.grupo}` : 'Editar Grupo')

  const { data: allRotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: () =>
      import('@/lib/axios').then(({ api }) =>
        api.get<RotaItem[]>('/rotas').then(r => r.data)
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(grupoSchema as never) })

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

  const routeGroups = groupByModule(allRotas)

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!grupo) return <p className="text-destructive">Grupo não encontrado.</p>

  return (
    <CrudFormLayout
      title="Editar grupo"
      backTo="/grupos"
      cardTitle="Dados do grupo"
      onSubmit={handleSubmit(d => updateMutation.mutate(d))}
      actions={
        <SaveButton
          isPending={updateMutation.isPending || syncRotasMutation.isPending}
        />
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
        <CheckboxGroupList
          groups={routeGroups}
          selectedIds={selectedIds}
          onToggle={toggleRota}
          disabled={updateMutation.isPending || syncRotasMutation.isPending}
          emptyMessage="Nenhuma rota disponível."
        />
      </div>
    </CrudFormLayout>
  )
}
