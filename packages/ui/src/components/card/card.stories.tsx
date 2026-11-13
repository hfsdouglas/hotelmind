import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

const meta = {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Reserva #1024</CardTitle>
        <CardDescription>Check-in em 12/12</CardDescription>
      </CardHeader>
      <CardContent>Suíte Luxo, 2 hóspedes.</CardContent>
      <CardFooter>3 diárias</CardFooter>
    </Card>
  ),
}
