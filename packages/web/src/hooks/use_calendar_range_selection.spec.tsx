import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCalendarRangeSelection } from './use_calendar_range_selection'

const SUITE_101 = { id: 'quarto-101', identificacao: '101' }
const SUITE_102 = { id: 'quarto-102', identificacao: '102' }

interface Harness {
  inside: HTMLElement
  outside: HTMLElement
  refs: { current: HTMLElement }[]
}

let harness: Harness

function mouse_event(type: string, target: EventTarget) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0 }))
}

function render_selection(paused = false) {
  return renderHook(
    ({ paused: is_paused }) =>
      useCalendarRangeSelection({
        regionRefs: harness.refs,
        paused: is_paused,
      }),
    { initialProps: { paused } }
  )
}

beforeEach(() => {
  const inside = document.createElement('div')
  const outside = document.createElement('div')
  document.body.append(inside, outside)
  harness = { inside, outside, refs: [{ current: inside }] }
})

afterEach(() => {
  harness.inside.remove()
  harness.outside.remove()
  vi.restoreAllMocks()
})

describe('useCalendarRangeSelection - drag', () => {
  it('starts with no selection and not dragging', () => {
    const { result } = render_selection()

    expect(result.current.selection).toBeNull()
    expect(result.current.isDragging).toBe(false)
  })

  it('startDrag creates a selection with anchor equal to focus and starts dragging', () => {
    const { result } = render_selection()

    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))

    expect(result.current.selection).toEqual({
      quarto_id: SUITE_101.id,
      quarto_identificacao: '101',
      anchor: '2026-12-01',
      focus: '2026-12-01',
    })
    expect(result.current.isDragging).toBe(true)
  })

  it('extendDrag updates the focus and keeps the origin suite', () => {
    const { result } = render_selection()

    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-02'))
    act(() => result.current.extendDrag('2026-12-04'))

    expect(result.current.selection).toMatchObject({
      quarto_id: SUITE_101.id,
      anchor: '2026-12-01',
      focus: '2026-12-04',
    })
  })

  it('extendDrag is ignored when no drag is active', () => {
    const { result } = render_selection()

    act(() => result.current.extendDrag('2026-12-04'))

    expect(result.current.selection).toBeNull()
  })

  it('extendDrag is ignored after the drag finished', () => {
    const { result } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-04'))
    act(() => mouse_event('mouseup', window))

    act(() => result.current.extendDrag('2026-12-10'))

    expect(result.current.selection?.focus).toBe('2026-12-04')
  })

  it('mouseup on the window finishes the drag and keeps a multi-day selection', () => {
    const { result } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-04'))

    act(() => mouse_event('mouseup', window))

    expect(result.current.isDragging).toBe(false)
    expect(result.current.selection).toMatchObject({
      anchor: '2026-12-01',
      focus: '2026-12-04',
    })
  })

  it('mouseup with a single day discards the selection', () => {
    const { result } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))

    act(() => mouse_event('mouseup', window))

    expect(result.current.isDragging).toBe(false)
    expect(result.current.selection).toBeNull()
  })

  it('a new startDrag replaces the previous selection', () => {
    const { result } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-04'))
    act(() => mouse_event('mouseup', window))

    act(() => result.current.startDrag(SUITE_102, '2026-12-08'))

    expect(result.current.selection).toEqual({
      quarto_id: SUITE_102.id,
      quarto_identificacao: '102',
      anchor: '2026-12-08',
      focus: '2026-12-08',
    })
  })

  it('getCellState delegates to the range helper', () => {
    const { result } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-03'))

    expect(result.current.getCellState(SUITE_101.id, '2026-12-01')).toBe(
      'start'
    )
    expect(result.current.getCellState(SUITE_101.id, '2026-12-02')).toBe(
      'middle'
    )
    expect(result.current.getCellState(SUITE_101.id, '2026-12-03')).toBe('end')
    expect(result.current.getCellState(SUITE_101.id, '2026-12-04')).toBe('none')
    expect(result.current.getCellState(SUITE_102.id, '2026-12-02')).toBe('none')
  })

  it('only listens to mouseup on the window while dragging', () => {
    const add_spy = vi.spyOn(window, 'addEventListener')
    const { result } = render_selection()
    const mouseup_before = add_spy.mock.calls.filter(c => c[0] === 'mouseup')

    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    const mouseup_after = add_spy.mock.calls.filter(c => c[0] === 'mouseup')

    expect(mouseup_before).toHaveLength(0)
    expect(mouseup_after.length).toBeGreaterThan(0)
  })
})

describe('useCalendarRangeSelection - clearing', () => {
  function select_range(result: ReturnType<typeof render_selection>['result']) {
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))
    act(() => result.current.extendDrag('2026-12-04'))
    act(() => mouse_event('mouseup', window))
  }

  it('mousedown outside every region clears the selection', () => {
    const { result } = render_selection()
    select_range(result)

    act(() => mouse_event('mousedown', harness.outside))

    expect(result.current.selection).toBeNull()
  })

  it('mousedown inside a region keeps the selection', () => {
    const { result } = render_selection()
    select_range(result)

    act(() => mouse_event('mousedown', harness.inside))

    expect(result.current.selection).not.toBeNull()
  })

  it('mousedown inside any of several regions keeps the selection', () => {
    const second = document.createElement('div')
    document.body.append(second)
    harness.refs.push({ current: second })
    const { result } = render_selection()
    select_range(result)

    act(() => mouse_event('mousedown', second))

    expect(result.current.selection).not.toBeNull()
    second.remove()
  })

  it('Escape clears the selection', () => {
    const { result } = render_selection()
    select_range(result)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current.selection).toBeNull()
  })

  it('other keys do not clear the selection', () => {
    const { result } = render_selection()
    select_range(result)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current.selection).not.toBeNull()
  })

  it('clear() removes the selection', () => {
    const { result } = render_selection()
    select_range(result)

    act(() => result.current.clear())

    expect(result.current.selection).toBeNull()
    expect(result.current.isDragging).toBe(false)
  })

  it('does not clear on outside click or Escape while paused', () => {
    const { result } = render_selection(true)
    select_range(result)

    act(() => mouse_event('mousedown', harness.outside))
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current.selection).not.toBeNull()
  })

  it('resumes clearing when paused goes back to false', () => {
    const { result, rerender } = render_selection(true)
    select_range(result)
    rerender({ paused: false })

    act(() => mouse_event('mousedown', harness.outside))

    expect(result.current.selection).toBeNull()
  })

  it('removes its listeners on unmount', () => {
    const remove_spy = vi.spyOn(document, 'removeEventListener')
    const add_spy = vi.spyOn(document, 'addEventListener')
    const { unmount } = render_selection()

    unmount()

    for (const type of ['mousedown', 'keydown']) {
      const added = add_spy.mock.calls.filter(c => c[0] === type).length
      const removed = remove_spy.mock.calls.filter(c => c[0] === type).length
      expect(added).toBeGreaterThan(0)
      expect(removed).toBeGreaterThanOrEqual(added)
    }
  })

  it('removes the window mouseup listener on unmount during a drag', () => {
    const remove_spy = vi.spyOn(window, 'removeEventListener')
    const { result, unmount } = render_selection()
    act(() => result.current.startDrag(SUITE_101, '2026-12-01'))

    unmount()

    expect(remove_spy.mock.calls.some(c => c[0] === 'mouseup')).toBe(true)
  })
})
