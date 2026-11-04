import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table'

describe('Table', () => {
  it('renders standard table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Standard 101</TableCell>
            <TableCell>Disponível</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Standard 101')).toBeInTheDocument()
    expect(screen.getByText('Disponível')).toBeInTheDocument()
  })
})
