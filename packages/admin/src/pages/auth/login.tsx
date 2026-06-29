import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useLogin } from '@/hooks/useLogin'
import { login_schema, type LoginFormData } from '@/schemas/auth.schema'

export function LoginPage() {
  const { login, isPending } = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(login_schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">HotelMind Admin</h1>
        <p className="text-sm text-muted-foreground">Acesso restrito a administradores</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => login(data))} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@hotelmind.com.br" {...field} />
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
