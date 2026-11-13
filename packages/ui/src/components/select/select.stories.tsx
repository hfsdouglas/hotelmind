import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'Components/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56" aria-label="Tipo de quarto">
        <SelectValue placeholder="Tipo de quarto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="standard">Standard</SelectItem>
        <SelectItem value="luxo">Luxo</SelectItem>
        <SelectItem value="suite">Suíte</SelectItem>
      </SelectContent>
    </Select>
  ),
}
