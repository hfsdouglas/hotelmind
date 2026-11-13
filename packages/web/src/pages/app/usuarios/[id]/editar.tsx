import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Label } from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { gruposService } from '@/api/grupos.service'
import { usuariosService } from '@/api/usuarios.service'
import { CheckboxGrid } from '@/components/forms/checkbox_grid'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type UsuarioUpdateFormData,
  usuarioUpdateSchema,
} from '@/schemas/usuarios/usuario_schema'

type FormData = UsuarioUpdateFormData

export function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosService.get(id!),
    enabled: !!id,
  })

  usePageTitle(
    usuario?.nome_completo
      ? `Editar Usuário - ${usuario.nome_completo}`
      : 'Editar Usuário'
  )

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
    reset,
  } = useForm<FormData>({ resolver: zodResolver(usuarioUpdateSchema as never) })

  useEffect(() => {
    if (usuario) {
      reset({
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        nascimento: usuario.nascimento?.split('T')[0] ?? '',
        genero: usuario.genero,
        celular: usuario.celular,
        cpf: usuario.cpf,
        rg: usuario.rg ?? '',
        grupos_ids: usuario.grupos_ids ?? '',
      })
    }
  }, [usuario, reset])

  const currentGruposIds = watch('grupos_ids') ?? ''
  const selectedGrupos = new Set(currentGruposIds.split(',').filter(Boolean))

  function toggleGrupo(gid: string) {
    const next = new Set(selectedGrupos)
    if (next.has(gid)) next.delete(gid)
    else next.add(gid)
    setValue('grupos_ids', Array.from(next).join(','))
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      usuariosService.update(id!, {
        ...data,
        senha: data.senha || undefined,
        rg: data.rg || null,
        grupos_ids: data.grupos_ids || null,
      }),
    onSuccess: () => {
      toast.success('Usuário atualizado.')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      navigate('/usuarios')
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um usuário com este e-mail, CPF ou celular.')
      } else {
        toast.error('Erro ao atualizar usuário.')
      }
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!usuario)
    return <p className="text-destructive">Usuário não encontrado.</p>

  return (
    <CrudFormLayout
      title="Editar usuário"
      backTo="/usuarios"
      cardTitle="Dados do usuário"
      onSubmit={handleSubmit(d => mutation.mutate(d))}
      actions={<SaveButton isPending={mutation.isPending} />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome_completo">Nome completo</Label>
          <Input id="nome_completo" {...register('nome_completo')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="senha">Nova senha</Label>
          <Input
            id="senha"
            type="password"
            {...register('senha')}
            placeholder="Deixe em branco para não alterar"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nascimento">Data de nascimento</Label>
          <Input id="nascimento" type="date" {...register('nascimento')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="genero">Gênero</Label>
          <Input id="genero" {...register('genero')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="celular">Celular</Label>
            <Input id="celular" {...register('celular')} maxLength={11} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register('cpf')} maxLength={11} />
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
