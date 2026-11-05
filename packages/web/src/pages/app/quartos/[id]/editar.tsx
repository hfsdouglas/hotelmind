import { zodResolver } from '@hookform/resolvers/zod'
import { TIPOS_CAMA, type TipoCama } from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { quartosService } from '@/api/quartos.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
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
import { Card, CardContent } from '@/components/ui/card'
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
import {
  type QuartoFormData,
  quartoSchema,
} from '@/schemas/quartos/quarto_schema'

function format_bed_type(type: string) {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function EditarQuartoPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirm_open, setConfirmOpen] = useState(false)
  const [pending_data, setPendingData] = useState<QuartoFormData | null>(null)

  const { data: room, isLoading } = useQuery({
    queryKey: ['quarto', id],
    queryFn: () => quartosService.get(id),
    enabled: !!id,
  })

  const { data: categories } = useQuery({
    queryKey: ['categorias_quartos', 'edit'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuartoFormData>({
    resolver: zodResolver(quartoSchema as never),
    defaultValues: {
      categoria_id: '',
      identificacao: '',
      descricao: '',
      limite_hospedes: 1,
      status: 'S',
      camas: [{ tipo: 'casal', quantidade: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'camas',
  })

  useEffect(() => {
    if (room) {
      reset({
        categoria_id: room.categoria_id,
        identificacao: room.identificacao,
        descricao: room.descricao ?? '',
        limite_hospedes: room.limite_hospedes,
        status: room.status,
        camas: room.camas.map(bed => ({
          tipo: bed.tipo,
          quantidade: bed.quantidade,
        })),
      })
    }
  }, [room, reset])

  const mutation = useMutation({
    mutationFn: (data: QuartoFormData) =>
      quartosService.update(id, {
        categoria_id: data.categoria_id,
        identificacao: data.identificacao,
        descricao: data.descricao,
        limite_hospedes: Number(data.limite_hospedes),
        status: data.status,
        camas: data.camas.map(bed => ({
          tipo: bed.tipo as TipoCama,
          quantidade: Number(bed.quantidade),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quartos'] })
      queryClient.invalidateQueries({ queryKey: ['quarto', id] })
      toast.success('Quarto atualizado com sucesso.')
      navigate('/quartos')
    },
    onError: (error: { response?: { status?: number } }) =>
      toast.error(
        error.response?.status === 409
          ? 'Já existe um quarto com esta identificação.'
          : 'Erro ao atualizar quarto.'
      ),
  })

  function onSubmit(data: QuartoFormData) {
    if (room?.status === 'S' && data.status === 'N') {
      setPendingData(data)
      setConfirmOpen(true)
    } else {
      mutation.mutate(data)
    }
  }

  if (isLoading || !room || !categories) return <p>Carregando quarto...</p>

  const selectable_categories = categories.data.some(
    category => category.id === room.categoria_id && category.status === 'N'
  )
    ? [
        room.categoria,
        ...categories.data.filter(
          category =>
            category.id !== room.categoria_id && category.status === 'S'
        ),
      ]
    : categories.data.filter(category => category.status === 'S')

  return (
    <>
      <CrudFormLayout
        title="Editar quarto"
        backTo="/quartos"
        cardTitle="Dados do quarto"
        onSubmit={handleSubmit(onSubmit)}
        actions={<SaveButton isPending={mutation.isPending} />}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoria_id">Categoria *</Label>
            <Controller
              name="categoria_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={val => {
                    if (val) field.onChange(val)
                  }}
                >
                  <SelectTrigger id="categoria_id">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectable_categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria_id && (
              <p className="text-sm text-destructive">
                {errors.categoria_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identificacao">Identificação *</Label>
            <Input id="identificacao" {...register('identificacao')} />
            {errors.identificacao && (
              <p className="text-sm text-destructive">
                {errors.identificacao.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register('descricao')} />
            {errors.descricao && (
              <p className="text-sm text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="limite_hospedes">Limite de hóspedes *</Label>
            <Input
              id="limite_hospedes"
              type="number"
              min="1"
              {...register('limite_hospedes')}
            />
            {errors.limite_hospedes && (
              <p className="text-sm text-destructive">
                {errors.limite_hospedes.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Ativo</SelectItem>
                    <SelectItem value="N">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Configuração de camas</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ tipo: 'solteiro', quantidade: 1 })}
              >
                Adicionar cama
              </Button>
            </div>
            {errors.camas?.message && (
              <p className="text-sm text-destructive">{errors.camas.message}</p>
            )}
            {errors.camas?.root?.message && (
              <p className="text-sm text-destructive">
                {errors.camas.root.message}
              </p>
            )}
            {fields.map((field, index) => (
              <div className="flex items-end gap-3" key={field.id}>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor={`tipo-${index}`}>Tipo *</Label>
                  <Controller
                    name={`camas.${index}.tipo`}
                    control={control}
                    render={({ field: subField }) => (
                      <Select
                        value={subField.value}
                        onValueChange={subField.onChange}
                      >
                        <SelectTrigger id={`tipo-${index}`}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_CAMA.map(type => (
                            <SelectItem key={type} value={type}>
                              {format_bed_type(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-28 flex flex-col gap-1.5">
                  <Label htmlFor={`quantidade-${index}`}>Quantidade *</Label>
                  <Input
                    id={`quantidade-${index}`}
                    type="number"
                    min="1"
                    {...register(`camas.${index}.quantidade`)}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          {room.categoria.status === 'N' && (
            <p className="text-sm text-muted-foreground">
              A categoria atual está inativa. Selecione uma categoria ativa para
              alterar o vínculo.
            </p>
          )}

          {categories.data.length === 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria cadastrada.
                </p>
                <Button asChild className="mt-3">
                  <Link to="/categorias_quartos/novo">Criar categoria</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </CrudFormLayout>

      <AlertDialog open={confirm_open} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar quarto?</AlertDialogTitle>
            <AlertDialogDescription>
              O quarto será preservado, mas deixará de estar disponível para
              novos usos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending_data) mutation.mutate(pending_data)
                setConfirmOpen(false)
              }}
            >
              Inativar quarto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
