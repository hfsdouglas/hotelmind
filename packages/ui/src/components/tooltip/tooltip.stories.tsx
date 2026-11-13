import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Passe o mouse</Button>
        </TooltipTrigger>
        <TooltipContent>Dica de uso</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
