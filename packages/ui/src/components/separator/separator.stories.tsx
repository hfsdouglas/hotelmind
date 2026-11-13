import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta = {
  title: 'Components/Separator',
  component: Separator,
  decorators: [
    Story => (
      <div className="h-12 w-48">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}
export const Vertical: Story = { args: { orientation: 'vertical' } }
