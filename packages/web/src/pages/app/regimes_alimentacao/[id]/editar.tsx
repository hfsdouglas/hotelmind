import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { ColorPicker } from '@/components/ui/color_picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  type RegimeAlimentacaoFormData,
  regimeAlimentacaoSchema,
} from '@/schemas/regimes_alimentacao/regime_alimentacao_schema'

export function EditarRegimeAlimentacaoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: regime, isLoading } = useQuery({
    queryKey: ['regimes_alimentacao', id],
    queryFn: () => regimesAlimentacaoService.get(id ?? ''),
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RegimeAlimentacaoFormData>({
    resolver: zodResolver(regimeAlimentacaoSchema as never),
    defaultValues: {
      titulo: '',
      descricao: '',
      cor_pulseira: '#2563EB',
      ativo: true,
    },
  })

  useEffect(() => {
    if (regime) {
      reset({
        titulo: regime.titulo,
        descricao: regime.descricao ?? '',
        cor_pulseira: regime.cor_pulseira,
        ativo: regime.ativo,
      })
    }
  }, [regime, reset])

  const mutation = useMutation({
    mutationFn: (data: RegimeAlimentacaoFormData) =>
      regimesAlimentacaoService.update(id ?? '', {
        titulo: data.titulo,
        descricao: data.descricao ? data.descricao : null,
        cor_pulseira: data.cor_pulseira,
        ativo: data.ativo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regimes_alimentacao'] })
      toast.success('Regime de Alimentação atualizado com sucesso.')
      navigate('/regimes_alimentacao')
    },
    onError: (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        toast.error(
          'Já existe um regime de Alimentação cadastrado com este título.'
        )
      } else {
        toast.error('Erro ao atualizar regime de Alimentação.')
      }
    },
  })

  if (isLoading) {
    return (
      <CrudFormLayout
        title="Editar regime de Alimentação"
        backTo="/regimes_alimentacao"
        cardTitle="Dados do regime"
        onSubmit={() => {}}
        actions={<div />}
      >
        <p className="text-muted-foreground">Carregando dados do regime...</p>
      </CrudFormLayout>
    )
  }

  return (
    <CrudFormLayout
      title="Editar regime de Alimentação"
      backTo="/regimes_alimentacao"
      cardTitle="Dados do regime"
      onSubmit={handleSubmit(data => mutation.mutate(data))}
      actions={<SaveButton isPending={mutation.isPending} />}
    >
      <div className="flex flex-col gap-5">
        {/* Campo Título */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            placeholder="Ex: Café da Manhã, All Inclusive..."
            {...register('titulo')}
          />
          {errors.titulo && (
            <p className="text-sm text-destructive">{errors.titulo.message}</p>
          )}
        </div>

        {/* Campo Descrição (Textarea) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            rows={3}
            placeholder="Descreva o que está incluso neste regime de Alimentação..."
            {...register('descricao')}
          />
          {errors.descricao && (
            <p className="text-sm text-destructive">
              {errors.descricao.message}
            </p>
          )}
        </div>

        {/* Color picker para a cor da pulseira */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cor_pulseira">Cor da pulseira *</Label>
          <Controller
            name="cor_pulseira"
            control={control}
            render={({ field }) => (
              <ColorPicker
                id="cor_pulseira"
                value={field.value}
                onChange={field.onChange}
                showWristbandBadge={true}
              />
            )}
          />
          {errors.cor_pulseira && (
            <p className="text-sm text-destructive">
              {errors.cor_pulseira.message}
            </p>
          )}
        </div>

        {/* Status: Radiobutton (Ativado / Desativado) */}
        <div className="flex flex-col gap-2">
          <Label id="status-label">Status</Label>
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <div
                role="radiogroup"
                aria-labelledby="status-label"
                className="flex h-9 items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <input
                    id="status_ativado"
                    type="radio"
                    name="status"
                    value="ativado"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  <Label htmlFor="status_ativado" className="cursor-pointer">
                    Ativado
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="status_desativado"
                    type="radio"
                    name="status"
                    value="desativado"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  <Label htmlFor="status_desativado" className="cursor-pointer">
                    Desativado
                  </Label>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </CrudFormLayout>
  )
}
