import type { Meta, StoryObj } from '@storybook/react-vite'
import tokens_css from './tokens.css?raw'

interface Token {
  name: string
  light: string
  dark: string
}

interface Group {
  title: string
  tokens: Token[]
}

function declarations(block: string) {
  return [...block.matchAll(/^\s*(--(?!radius)[\w-]+):\s*([^;]+);/gm)].map(
    m => [m[1], m[2].trim()] as const
  )
}

function block(selector: string) {
  const start = tokens_css.indexOf(`${selector} {`)
  return tokens_css.slice(start, tokens_css.indexOf('\n}', start))
}

function build_groups(): Group[] {
  const dark = new Map(declarations(block('.dark')))
  const groups: Group[] = []
  let title = 'Tokens'
  for (const line of block(':root').split('\n')) {
    const heading = line.match(/^\s*\/\*\s*(.+?)\s*\*\/\s*$/)
    if (heading) {
      title = heading[1]
      continue
    }
    const [declaration] = declarations(line)
    if (!declaration) continue
    const [name, light] = declaration
    let group = groups.find(g => g.title === title)
    if (!group) {
      group = { title, tokens: [] }
      groups.push(group)
    }
    group.tokens.push({ name, light, dark: dark.get(name) ?? light })
  }
  return groups
}

const groups = build_groups()

function Palette() {
  return (
    <div className="w-full max-w-5xl space-y-8 p-6">
      {groups.map(group => (
        <section key={group.title} className="space-y-3">
          <h2 className="font-semibold text-lg">{group.title}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {group.tokens.map(token => (
              <div
                key={token.name}
                className="overflow-hidden rounded-lg border bg-card text-card-foreground"
              >
                <div
                  className="h-16 border-b"
                  style={{ backgroundColor: `var(${token.name})` }}
                  role="img"
                  aria-label={`Cor ${token.name}`}
                />
                <div className="space-y-0.5 p-2 text-xs">
                  <p className="font-medium font-mono">{token.name}</p>
                  <p className="font-mono text-muted-foreground">
                    Claro {token.light}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    Escuro {token.dark}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const meta = {
  title: 'Foundations/Colors',
  component: Palette,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Palette>

export default meta
export const Palette_: StoryObj<typeof meta> = { name: 'Palette' }
