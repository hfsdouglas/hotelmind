import type { Meta, StoryObj } from '@storybook/react-vite'
import { LogOut, Moon } from 'lucide-react'
import { SidebarUserCard } from './sidebar_user_card'

const items = [
  { id: 'tema', label: 'Modo escuro', icon: Moon, onSelect: () => {} },
  {
    id: 'sair',
    label: 'Sair',
    icon: LogOut,
    destructive: true,
    separatorBefore: true,
    onSelect: () => {},
  },
]

const meta = {
  title: 'Patterns/SidebarUserCard',
  component: SidebarUserCard,
  args: { name: 'Maria Souza', secondary: 'Hotel Luxo', items },
  decorators: [
    Story => (
      <div className="w-64 rounded-xl border border-sidebar-border bg-sidebar p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarUserCard>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {}
export const Collapsed: Story = {
  args: { collapsed: true },
  decorators: [
    Story => (
      <div className="w-[4.5rem]">
        <Story />
      </div>
    ),
  ],
}
