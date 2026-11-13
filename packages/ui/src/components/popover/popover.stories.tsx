import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: { children: null },
} satisfies Meta<typeof Popover>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </PopoverTrigger>
      <PopoverContent>Conteúdo do popover</PopoverContent>
    </Popover>
  ),
}
