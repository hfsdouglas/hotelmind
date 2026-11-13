import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../../components/input/input'
import { Label } from '../../components/label/label'
import { CrudFormLayout } from './crud_form_layout'

const meta = {
  title: 'Patterns/CrudFormLayout',
  component: CrudFormLayout,
  parameters: { layout: 'padded' },
  args: {
    title: 'Novo grupo',
    renderBackLink: icon => (
      <a href="/grupos" aria-label="Voltar">
        {icon}
      </a>
    ),
    onSubmit: event => event.preventDefault(),
    children: (
      <div className="grid gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" />
      </div>
    ),
  },
} satisfies Meta<typeof CrudFormLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithCardTitle: Story = { args: { cardTitle: 'Dados gerais' } }
