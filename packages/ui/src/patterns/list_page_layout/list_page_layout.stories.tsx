import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../components/button/button'
import { SearchBar } from '../search_bar/search_bar'
import { ListPageLayout } from './list_page_layout'

const meta = {
  title: 'Patterns/ListPageLayout',
  component: ListPageLayout,
  parameters: { layout: 'padded' },
  args: {
    title: 'Quartos',
    action: <Button size="sm">Novo quarto</Button>,
    searchBar: <SearchBar onSearch={() => undefined} />,
    children: <p className="text-sm text-muted-foreground">Resultados aqui.</p>,
  },
} satisfies Meta<typeof ListPageLayout>

export default meta
export const Default: StoryObj<typeof meta> = {}
