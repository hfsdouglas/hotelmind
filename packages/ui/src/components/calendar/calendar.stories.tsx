import type { Meta, StoryObj } from '@storybook/react-vite'
import { ptBR } from 'date-fns/locale'
import { Calendar } from './calendar'

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: { mode: 'single', locale: ptBR },
} satisfies Meta<typeof Calendar>

export default meta
export const Default: StoryObj<typeof meta> = {}
