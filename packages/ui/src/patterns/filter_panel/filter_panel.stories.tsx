import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterPanel } from './filter_panel'

const meta = {
  title: 'Patterns/FilterPanel',
  component: FilterPanel,
  args: { children: <p className="text-sm">Filtros secundários aqui.</p> },
} satisfies Meta<typeof FilterPanel>

export default meta
export const Default: StoryObj<typeof meta> = {}
