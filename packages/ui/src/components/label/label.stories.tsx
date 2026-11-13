import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'

const meta = {
  title: 'Components/Label',
  component: Label,
  args: { children: 'Nome completo' },
} satisfies Meta<typeof Label>

export default meta
export const Default: StoryObj<typeof meta> = {}
