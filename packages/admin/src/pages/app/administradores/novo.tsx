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
} from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { administradoresService } from '@/api/administradores.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type AdministradorCreateFormData,
  administradorCreateSchema,
} from '@/schemas/administradores/administrador_schema'

type FormData = AdministradorCreateFormData

export function AdministradorNovoPage() {
  usePageTitle('Novo Administrador')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(administradorCreateSchema),
    defaultValues: {
      nome_completo: '',
      email: '',
      senha: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      administradoresService.create({ ...data, status: 'S' }),
    onSuccess: () => {
      toast.success('Administrador criado.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
      navigate('/administradores')
    },
    onError: () =>
      toast.error('Erro ao criar administrador. E-mail pode já existir.'),
  })

  return (
    <CrudFormLayout
      title="Novo Administrador"
      backTo="/administradores"
      onSubmit={form.handleSubmit(d => mutate(d))}
      actions={
        <>
          <SaveButton isPending={isPending} />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/administradores')}
          >
            Cancelar
          </Button>
        </>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          {(['nome_completo', 'email', 'senha'] as const).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>
                    {field === 'nome_completo'
                      ? 'Nome completo'
                      : field === 'email'
                        ? 'E-mail'
                        : 'Senha'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={
                        field === 'senha'
                          ? 'password'
                          : field === 'email'
                            ? 'email'
                            : 'text'
                      }
                      {...f}
                    />
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
