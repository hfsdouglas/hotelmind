import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResultCount } from './result_count'

const meta = {
  title: 'Patterns/ResultCount',
  component: ResultCount,
  args: { total: 42 },
} satisfies Meta<typeof ResultCount>

export default meta
type Story = StoryObj<typeof meta>

export const Plural: Story = {}
export const Singular: Story = { args: { total: 1 } }
export const Empty: Story = { args: { total: 0 } }
