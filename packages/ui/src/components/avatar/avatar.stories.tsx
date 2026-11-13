import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/imagem-inexistente.png" alt="Maria Silva" />
      <AvatarFallback>MS</AvatarFallback>
    </Avatar>
  ),
}
