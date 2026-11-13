import { act, fireEvent, renderHook } from '@testing-library/react'
import type { RefObject } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useReservaSelecionada } from './use_reserva_selecionada'

let grid: HTMLDivElement
let actions: HTMLDivElement
let outside: HTMLButtonElement

function ref_of(element: HTMLElement): RefObject<HTMLElement | null> {
  return { current: element }
}

function render_hook_with(
  initial: { paused?: boolean; idsVisiveis?: readonly string[] } = {}
) {
  return renderHook(
    (props: { paused: boolean; idsVisiveis: readonly string[] }) =>
      useReservaSelecionada({
        regionRefs: [ref_of(grid), ref_of(actions)],
        paused: props.paused,
        idsVisiveis: props.idsVisiveis,
      }),
    {
      initialProps: {
        paused: initial.paused ?? false,
        idsVisiveis: initial.idsVisiveis ?? ['a', 'b'],
      },
    }
  )
}

beforeEach(() => {
  grid = document.createElement('div')
  actions = document.createElement('div')
  outside = document.createElement('button')
  document.body.append(grid, actions, outside)
})

afterEach(() => {
  grid.remove()
  actions.remove()
  outside.remove()
})

describe('useReservaSelecionada', () => {
  it('starts with nothing selected', () => {
    const { result } = render_hook_with()

    expect(result.current.selecionadaId).toBeNull()
  })

  it('selects a reservation', () => {
    const { result } = render_hook_with()

    act(() => result.current.selecionar('a'))

    expect(result.current.selecionadaId).toBe('a')
  })

  it('switches the selection to another reservation', () => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    act(() => result.current.selecionar('b'))

    expect(result.current.selecionadaId).toBe('b')
  })

  it('keeps the selection when selecting the same reservation again (no toggle)', () => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    act(() => result.current.selecionar('a'))

    expect(result.current.selecionadaId).toBe('a')
  })

  it('clears on Escape', () => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(result.current.selecionadaId).toBeNull()
  })

  it('keeps the selection on Escape while paused', () => {
    const { result } = render_hook_with({ paused: true })
    act(() => result.current.selecionar('a'))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(result.current.selecionadaId).toBe('a')
  })

  it('clears on pointerdown outside every region', () => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    fireEvent.pointerDown(outside)

    expect(result.current.selecionadaId).toBeNull()
  })

  it.each([
    ['grid', () => grid],
    ['actions bar', () => actions],
  ])('keeps the selection on pointerdown inside the %s', (_name, region) => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    fireEvent.pointerDown(region())

    expect(result.current.selecionadaId).toBe('a')
  })

  it('keeps the selection on pointerdown outside while paused', () => {
    const { result } = render_hook_with({ paused: true })
    act(() => result.current.selecionar('a'))

    fireEvent.pointerDown(outside)

    expect(result.current.selecionadaId).toBe('a')
  })

  it('clears when the selected id is no longer visible', () => {
    const { result, rerender } = render_hook_with({ idsVisiveis: ['a', 'b'] })
    act(() => result.current.selecionar('a'))

    rerender({ paused: false, idsVisiveis: ['b'] })

    expect(result.current.selecionadaId).toBeNull()
  })

  it('keeps the selection while its id stays visible', () => {
    const { result, rerender } = render_hook_with({ idsVisiveis: ['a', 'b'] })
    act(() => result.current.selecionar('a'))

    rerender({ paused: false, idsVisiveis: ['a'] })

    expect(result.current.selecionadaId).toBe('a')
  })

  it('clears with limpar()', () => {
    const { result } = render_hook_with()
    act(() => result.current.selecionar('a'))

    act(() => result.current.limpar())

    expect(result.current.selecionadaId).toBeNull()
  })
})
