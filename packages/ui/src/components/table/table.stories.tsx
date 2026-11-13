import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const meta = {
  title: 'Components/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quarto</TableHead>
          <TableHead>Hóspede</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>101</TableCell>
          <TableCell>Maria Silva</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
