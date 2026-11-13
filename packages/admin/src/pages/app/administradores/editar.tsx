import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
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
import { administradoresService } from '@/api/administradores.service'
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
  type AdministradorUpdateFormData,
  administradorUpdateSchema,
} from '@/schemas/administradores/administrador_schema'

type FormData = AdministradorUpdateFormData

export function AdministradorEditarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: admin } = useQuery({
    queryKey: ['admin:administrador', id],
    queryFn: () => administradoresService.findById(id!),
    enabled: !!id,
  })

  usePageTitle(
    admin?.nome_completo
      ? `Editar Administrador - ${admin.nome_completo}`
      : 'Editar Administrador'
  )

  const form = useForm<FormData>({
    resolver: zodResolver(administradorUpdateSchema),
    defaultValues: {
      nome_completo: '',
      email: '',
      senha: '',
      status: 'S',
    },
  })

  useEffect(() => {
    if (admin)
      form.reset({ ...admin, senha: '', status: admin.status as 'S' | 'N' })
  }, [admin, form])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const { senha, ...rest } = data
      return administradoresService.update(id!, {
        ...rest,
        ...(senha ? { senha } : {}),
      })
    },
    onSuccess: () => {
      toast.success('Administrador atualizado.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
      navigate('/administradores')
    },
    onError: () => toast.error('Erro ao atualizar administrador.'),
  })

  return (
    <CrudFormLayout
      title="Editar Administrador"
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
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senha"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>
                  Nova senha{' '}
                  <span className="text-muted-foreground text-xs">
                    (deixe em branco para manter)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input type="password" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
