import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { Button } from '../button/button'
import { Input } from '../input/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'

type Values = { nome: string }

function ExampleForm() {
  const form = useForm<Values>({ defaultValues: { nome: '' } })
  return (
    <Form {...form}>
      <form
        className="w-72 space-y-4"
        onSubmit={form.handleSubmit(() => undefined)}
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Como aparece na reserva.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  )
}

const meta = {
  title: 'Components/Form',
  component: ExampleForm,
} satisfies Meta<typeof ExampleForm>

export default meta
export const Default: StoryObj<typeof meta> = {}
