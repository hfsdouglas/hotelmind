import type { Meta, StoryObj } from '@storybook/react-vite'
import { SuiteSyncLogo } from './suite_sync_logo'

const meta = {
  title: 'Patterns/SuiteSyncLogo',
  component: SuiteSyncLogo,
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof SuiteSyncLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const IconOnly: Story = { args: { iconOnly: true } }
export const Admin: Story = { args: { badge: 'ADMIN', size: 'sm' } }
export const OnPrimary: Story = {
  args: { surface: 'on-primary' },
  decorators: [
    Story => (
      <div className="rounded-lg bg-primary p-6">
        <Story />
      </div>
    ),
  ],
}
