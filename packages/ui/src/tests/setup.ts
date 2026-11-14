import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom does not implement these APIs, which Radix UI relies on
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.setPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

// Node's experimental localStorage global shadows jsdom's: provide a simple
// in-memory Storage so persistence can be tested.
function create_storage_mock() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}
const storage_mock = create_storage_mock()
for (const target of [window, globalThis]) {
  Object.defineProperty(target, 'localStorage', {
    value: storage_mock,
    writable: true,
    configurable: true,
  })
}
