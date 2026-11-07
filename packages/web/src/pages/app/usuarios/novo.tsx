import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { gruposService } from '@/api/grupos.service'
import { usuariosService } from '@/api/usuarios.service'
import { CheckboxGrid } from '@/components/forms/CheckboxGrid'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type UsuarioCreateFormData,
  usuarioCreateSchema,
} from '@/schemas/usuarios/usuario_schema'

type FormData = UsuarioCreateFormData

export function NovoUsuarioPage() {
  usePageTitle('Novo Usuário')
  const navigate = useNavigate()

  const { data: gruposData } = useQuery({
    queryKey: ['grupos', { pagina: 1, limite: 250 }],
    queryFn: () => gruposService.list({ pagina: 1, limite: 250, status: 'S' }),
  })

  const grupos = gruposData?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(usuarioCreateSchema as never),
    defaultValues: { grupos_ids: '' },
  })

  const currentGruposIds = watch('grupos_ids') ?? ''
  const selectedGrupos = new Set(currentGruposIds.split(',').filter(Boolean))

  function toggleGrupo(id: string) {
    const next = new Set(selectedGrupos)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setValue('grupos_ids', Array.from(next).join(','))
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      usuariosService.create({
        ...data,
        grupos_ids: data.grupos_ids || null,
        rg: data.rg || null,
      }),
    onSuccess: () => {
      toast.success('Usuário criado com sucesso.')
      navigate('/usuarios')
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um usuário com este e-mail, CPF ou celular.')
      } else {
        toast.error('Erro ao criar usuário.')
      }
    },
  })

  return (
    <CrudFormLayout
      title="Novo usuário"
      backTo="/usuarios"
      cardTitle="Dados do usuário"
      onSubmit={handleSubmit(d => mutation.mutate(d))}
      actions={<SaveButton isPending={mutation.isPending} />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome_completo">Nome completo *</Label>
          <Input id="nome_completo" {...register('nome_completo')} />
          {errors.nome_completo && (
            <p className="text-sm text-destructive">
              {errors.nome_completo.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="senha">Senha *</Label>
          <Input id="senha" type="password" {...register('senha')} />
          {errors.senha && (
            <p className="text-sm text-destructive">{errors.senha.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nascimento">Data de nascimento *</Label>
          <Input id="nascimento" type="date" {...register('nascimento')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="genero">Gênero *</Label>
          <Input id="genero" {...register('genero')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="celular">Celular *</Label>
            <Input id="celular" {...register('celular')} maxLength={11} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" {...register('cpf')} maxLength={11} />
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" {...register('rg')} />
        </div>
      </div>

      {grupos.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-base font-semibold mb-4">Grupos de acesso</h2>
          <CheckboxGrid
            items={grupos.map(g => ({ id: g.id, label: g.grupo }))}
            selectedIds={selectedGrupos}
            onToggle={toggleGrupo}
          />
        </div>
      )}
    </CrudFormLayout>
  )
}
