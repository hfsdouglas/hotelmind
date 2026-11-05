import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

describe('Card', () => {
  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Cartão</CardTitle>
          <CardDescription>Descrição do cartão</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo principal</p>
        </CardContent>
        <CardFooter>
          <button type="button">Salvar</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Título do Cartão')).toBeInTheDocument()
    expect(screen.getByText('Descrição do cartão')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo principal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })
})
