import { zodResolver } from '@hookform/resolvers/zod'
import { TIPOS_CAMA, type TipoCama } from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { quartosService } from '@/api/quartos.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
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

export function NovoQuartoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuartoFormData>({
    resolver: zodResolver(quartoSchema as never),
    defaultValues: {
      categoria_id: '',
      identificacao: '',
      descricao: '',
      limite_hospedes: '' as unknown as number,
      status: 'S',
      camas: [{ tipo: 'casal', quantidade: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'camas',
  })

  const { data: categories } = useQuery({
    queryKey: ['categorias_quartos', 'ativas'],
    queryFn: () => categoriasQuartosService.list({ status: 'S', limite: 250 }),
  })

  const mutation = useMutation({
    mutationFn: (data: QuartoFormData) =>
      quartosService.create({
        categoria_id: data.categoria_id,
        identificacao: data.identificacao,
        descricao: data.descricao,
        limite_hospedes: Number(data.limite_hospedes),
        camas: data.camas.map(bed => ({
          tipo: bed.tipo as TipoCama,
          quantidade: Number(bed.quantidade),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quartos'] })
      toast.success('Quarto criado com sucesso.')
      navigate('/quartos')
    },
    onError: (error: { response?: { status?: number } }) =>
      toast.error(
        error.response?.status === 409
          ? 'Já existe um quarto com esta identificação.'
          : 'Erro ao criar quarto.'
      ),
  })

  if (!categories) return <p>Carregando categorias...</p>

  if (!categories.data.length)
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">Novo quarto</h1>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria ativa foi cadastrada.
            </p>
            <Button asChild className="w-auto shrink-0">
              <Link to="/categorias_quartos/novo">Criar categoria</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  return (
    <CrudFormLayout
      title="Novo quarto"
      backTo="/quartos"
      cardTitle="Dados do quarto"
      onSubmit={handleSubmit(data => mutation.mutate(data))}
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
                  {categories.data.map(category => (
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
      </div>
    </CrudFormLayout>
  )
}
