import type { Meta, StoryObj } from '@storybook/react-vite'
import { SaveButton } from './save_button'

const meta = {
  title: 'Patterns/SaveButton',
  component: SaveButton,
} satisfies Meta<typeof SaveButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
