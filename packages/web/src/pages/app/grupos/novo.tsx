import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { RotaItem } from '@/api/grupos.service'
import { gruposService } from '@/api/grupos.service'
import { CheckboxGroupList } from '@/components/forms/checkbox_group_list'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
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

export function NovoGrupoPage() {
  usePageTitle('Novo Grupo')
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(grupoSchema as never),
    defaultValues: { status: 'S' },
  })

  const { data: allRotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: () =>
      import('@/lib/axios').then(({ api }) =>
        api.get<RotaItem[]>('/rotas').then(r => r.data)
      ),
  })

  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(
    new Set()
  )

  function toggleRota(rotaId: string) {
    setSelectedRouteIds(prev => {
      const next = new Set(prev)
      if (next.has(rotaId)) {
        next.delete(rotaId)
      } else {
        next.add(rotaId)
      }
      return next
    })
  }

  const syncRotasMutation = useMutation({
    mutationFn: (id: string) =>
      gruposService.syncRotas(id, Array.from(selectedRouteIds)),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => gruposService.create(data),
    onSuccess: grupo => {
      syncRotasMutation.mutate(grupo.id, {
        onSuccess: () => {
          toast.success('Grupo criado com sucesso.')
          navigate('/grupos')
        },
        onError: () =>
          toast.error(
            'Grupo criado, mas houve um erro ao sincronizar as rotas.'
          ),
      })
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um grupo com este nome.')
      } else {
        toast.error('Erro ao criar grupo.')
      }
    },
  })

  const routeGroups = groupByModule(allRotas)
  const isPending = mutation.isPending || syncRotasMutation.isPending

  return (
    <CrudFormLayout
      title="Novo grupo"
      backTo="/grupos"
      cardTitle="Dados do grupo"
      onSubmit={handleSubmit(d => mutation.mutate(d))}
      actions={<SaveButton isPending={isPending} />}
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
            defaultValue="S"
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
          selectedIds={selectedRouteIds}
          onToggle={toggleRota}
          disabled={isPending}
          emptyMessage="Nenhuma rota disponível."
        />
      </div>
    </CrudFormLayout>
  )
}
