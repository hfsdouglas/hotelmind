import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

describe('Select', () => {
  it('renders select trigger with value', () => {
    render(
      <Select defaultValue="op1">
        <SelectTrigger aria-label="Opções">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="op1">Opção Um</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByRole('combobox', { name: 'Opções' })).toBeInTheDocument()
  })
})
