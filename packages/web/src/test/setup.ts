import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// jsdom does not implement window.matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// jsdom does not implement ResizeObserver — Radix UI (e.g. Checkbox's bubble
// input) relies on it unconditionally whenever mounted, so provide a no-op stub
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})
