import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchBar } from './search_bar'

const meta = {
  title: 'Patterns/SearchBar',
  component: SearchBar,
  args: { onSearch: () => undefined },
  decorators: [
    Story => (
      <div className="w-[560px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Maria' } }
