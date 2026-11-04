import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { describe, expect, it } from 'vitest'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './form'
import { Input } from './input'

function TestForm() {
  const form = useForm({
    defaultValues: { nome: '' },
  })

  useEffect(() => {
    form.setError('nome', { type: 'manual', message: 'Nome é obrigatório' })
  }, [form])

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe('Form components', () => {
  it('renders form item with label and error', () => {
    render(<TestForm />)

    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
  })
})
