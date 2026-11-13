import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { hoteisService } from '@/api/hoteis.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type HotelUpdateFormData,
  hotelUpdateSchema,
} from '@/schemas/hoteis/hotel_schema'

const fieldLabels: Record<string, string> = {
  nome_hotel: 'Nome do Hotel',
  razao_social: 'Razão Social',
  nome_fantasia: 'Nome Fantasia',
  cnpj: 'CNPJ',
  email_comercial: 'E-mail Comercial',
  telefone_comercial: 'Telefone Comercial',
  website: 'Website',
}

type FormData = HotelUpdateFormData

export function HotelEditarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: hotel } = useQuery({
    queryKey: ['admin:hotel', id],
    queryFn: () => hoteisService.findById(id!),
    enabled: !!id,
  })

  usePageTitle(
    hotel?.nome_fantasia || hotel?.nome_hotel
      ? `Editar Hotel - ${hotel.nome_fantasia || hotel.nome_hotel}`
      : 'Editar Hotel'
  )

  const form = useForm<FormData>({
    resolver: zodResolver(hotelUpdateSchema),
    defaultValues: {
      nome_hotel: '',
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      email_comercial: '',
      telefone_comercial: '',
      website: '',
      status: 'S',
    },
  })

  useEffect(() => {
    if (hotel)
      form.reset({
        ...hotel,
        website: hotel.website ?? '',
        status: hotel.status,
      })
  }, [hotel, form])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => hoteisService.update(id!, data),
    onSuccess: () => {
      toast.success('Hotel atualizado.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
      navigate('/hoteis')
    },
    onError: () => toast.error('Erro ao atualizar hotel.'),
  })

  return (
    <CrudFormLayout
      title="Editar Hotel"
      backTo="/hoteis"
      onSubmit={form.handleSubmit(d => mutate(d))}
      actions={
        <>
          <SaveButton isPending={isPending} />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/hoteis')}
          >
            Cancelar
          </Button>
        </>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          {(
            [
              'nome_hotel',
              'razao_social',
              'nome_fantasia',
              'cnpj',
              'email_comercial',
              'telefone_comercial',
              'website',
            ] as const
          ).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{fieldLabels[field] ?? field}</FormLabel>
                  <FormControl>
                    <Input {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="status"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={f.onChange} value={f.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="S">Ativo</SelectItem>
                    <SelectItem value="N">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </CrudFormLayout>
  )
}
