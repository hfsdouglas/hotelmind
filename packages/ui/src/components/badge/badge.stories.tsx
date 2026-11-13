import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Confirmada' },
} satisfies Meta<typeof Badge>

export default meta
export const Default: StoryObj<typeof meta> = {}
