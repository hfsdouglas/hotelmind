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
    defaultValues: { email: '' },
  })

  useEffect(() => {
    form.setError('email', { type: 'manual', message: 'Email é obrigatório' })
  }, [form])

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
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

    expect(screen.getByText('E-mail')).toBeInTheDocument()
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
  })
})
