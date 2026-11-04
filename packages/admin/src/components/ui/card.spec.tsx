import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'

describe('Card', () => {
  it('renders card sections correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Dados do Hotel</CardTitle>
          <CardDescription>Informações cadastrais</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo</p>
        </CardContent>
        <CardFooter>
          <button type="button">Avançar</button>
        </CardFooter>
      </Card>,
    )

    expect(screen.getByText('Dados do Hotel')).toBeInTheDocument()
    expect(screen.getByText('Informações cadastrais')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeInTheDocument()
  })
})
