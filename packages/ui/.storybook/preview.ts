import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'

const with_theme: Decorator = (Story, context) => {
  document.documentElement.classList.toggle(
    'dark',
    context.globals.theme === 'dark'
  )
  return Story()
}

const preview: Preview = {
  decorators: [with_theme],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: { expanded: true },
    layout: 'centered',
  },
}

export default preview
