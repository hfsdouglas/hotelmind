import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { hoteisService } from '@/api/hoteis.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type HotelCreateFormData,
  hotelCreateSchema,
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

type FormData = HotelCreateFormData

export function HotelNovoPage() {
  usePageTitle('Novo Hotel')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(hotelCreateSchema),
    defaultValues: {
      nome_hotel: '',
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      email_comercial: '',
      telefone_comercial: '',
      website: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => hoteisService.create(data),
    onSuccess: () => {
      toast.success('Hotel criado com sucesso.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
      navigate('/hoteis')
    },
    onError: () => toast.error('Erro ao criar hotel. Verifique CNPJ e e-mail.'),
  })

  return (
    <CrudFormLayout
      title="Novo Hotel"
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
        </div>
      </Form>
    </CrudFormLayout>
  )
}
