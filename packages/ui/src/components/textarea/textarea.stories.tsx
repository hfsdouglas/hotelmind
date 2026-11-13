import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { placeholder: 'Observações', 'aria-label': 'Observações' },
} satisfies Meta<typeof Textarea>

export default meta
export const Default: StoryObj<typeof meta> = {}
