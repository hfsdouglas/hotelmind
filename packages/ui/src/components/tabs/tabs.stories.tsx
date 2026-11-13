import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { children: null },
} satisfies Meta<typeof Tabs>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Tabs defaultValue="dados">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="hospedes">Hóspedes</TabsTrigger>
      </TabsList>
      <TabsContent value="dados">Dados da reserva</TabsContent>
      <TabsContent value="hospedes">Lista de hóspedes</TabsContent>
    </Tabs>
  ),
}
