import type { Meta, StoryObj } from '@storybook/react-vite'
import { LogOut, Moon } from 'lucide-react'
import { Button } from '../button/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown_menu'

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  args: { children: null },
} satisfies Meta<typeof DropdownMenu>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuItem>
          <Moon aria-hidden="true" />
          Modo escuro
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
