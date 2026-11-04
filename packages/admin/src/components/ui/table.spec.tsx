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
            <TableHead>Hotel</TableHead>
            <TableHead>CNPJ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Grand Palace</TableCell>
            <TableCell>12345678000199</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('Hotel')).toBeInTheDocument()
    expect(screen.getByText('Grand Palace')).toBeInTheDocument()
    expect(screen.getByText('12345678000199')).toBeInTheDocument()
  })
})
