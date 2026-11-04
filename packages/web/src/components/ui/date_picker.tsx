import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  date_display_to_iso,
  iso_to_date_display,
  mask_date,
} from '@/hooks/use_date_mask'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  value?: string // YYYY-MM-DD
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  className?: string
  id?: string
}

function parseIso(val?: string): Date | undefined {
  if (!val) return undefined
  const parts = val.split('-').map(Number)
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return undefined
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toIso(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  minDate,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(() => iso_to_date_display(value))

  useEffect(() => {
    setInputValue(iso_to_date_display(value))
  }, [value])

  const selectedDate = parseIso(value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = mask_date(e.target.value)
    setInputValue(masked)

    if (masked.length === 10) {
      const iso = date_display_to_iso(masked)
      if (iso) {
        onChange?.(iso)
      }
    } else if (masked.length === 0) {
      onChange?.('')
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="h-9 pr-9 font-normal text-sm"
      />

      <div className="absolute inset-y-0 right-0 flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Abrir calendário"
              aria-label="Abrir calendário"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              locale={ptBR}
              captionLayout="dropdown"
              startMonth={new Date(currentYear - 2, 0)}
              endMonth={new Date(currentYear + 10, 11)}
              selected={selectedDate}
              onSelect={d => {
                if (d) {
                  const iso = toIso(d)
                  setInputValue(iso_to_date_display(iso))
                  onChange?.(iso)
                  setOpen(false)
                }
              }}
              disabled={minDate ? d => d < minDate : undefined}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
