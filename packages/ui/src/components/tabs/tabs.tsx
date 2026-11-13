import * as React from 'react'
import { cn } from '../../lib/cn'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
  className?: string
}

export function Tabs({
  value,
  onValueChange,
  defaultValue = '',
  children,
  className,
}: TabsProps) {
  const [selected, setSelected] = React.useState(defaultValue)
  const currentValue = value !== undefined ? value : selected
  const handleChange = onValueChange || setSelected

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleChange }}
    >
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-11 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full overflow-x-auto gap-1 border',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled,
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isSelected = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isSelected
          ? 'bg-background text-foreground shadow-sm font-semibold'
          : 'hover:bg-background/60 hover:text-foreground text-muted-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
  forceMount = true,
}: {
  value: string
  children: React.ReactNode
  className?: string
  forceMount?: boolean
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const isSelected = context.value === value

  if (!isSelected && !forceMount) {
    return null
  }

  return (
    <div
      role="tabpanel"
      hidden={!isSelected}
      className={cn(
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        !isSelected && forceMount && 'hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
