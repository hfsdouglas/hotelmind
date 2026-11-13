import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Aceito os termos' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
