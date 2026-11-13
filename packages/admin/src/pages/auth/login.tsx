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
  SuiteSyncLogo,
} from '@hotelmind/ui'
import { useForm } from 'react-hook-form'
import { usePageTitle } from '@/hooks/use_document_title'
import { useLogin } from '@/hooks/use_login'
import { type LoginFormData, login_schema } from '@/schemas/auth/auth_schema'

export function LoginPage() {
  usePageTitle('Entrar')
  const { login, isPending } = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(login_schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="flex justify-center">
          <SuiteSyncLogo size="lg" badge="ADMIN" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Acesso restrito a administradores
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(data => login(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@hotelmind.com.br"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
