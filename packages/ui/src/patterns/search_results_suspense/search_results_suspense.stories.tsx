import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchResultsSkeleton } from './search_results_suspense'

const meta = {
  title: 'Patterns/SearchResultsSkeleton',
  component: SearchResultsSkeleton,
  args: { column_labels: ['Número', 'Categoria', ''], column_count: 3 },
  decorators: [
    Story => (
      <div className="flex h-72 w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchResultsSkeleton>

export default meta
export const Default: StoryObj<typeof meta> = {}
