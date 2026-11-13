import { ArrowLeft } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { Button } from '../../components/button/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/card/card'
import { cn } from '../../lib/cn'
import { SaveButton } from '../save_button/save_button'

export interface CrudFormLayoutProps {
  title: string
  /**
   * Renders the back link around the given icon. Keeps routing out of the
   * design system: apps pass their router link, e.g.
   * `icon => <Link to="/grupos">{icon}</Link>`.
   */
  renderBackLink: (icon: ReactNode) => ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  actions?: ReactNode
  submitLabel?: string
  isSubmitting?: boolean
  cardTitle?: string
  children: ReactNode
  className?: string
}

export function CrudFormLayout({
  title,
  renderBackLink,
  onSubmit,
  actions,
  submitLabel = 'Salvar',
  isSubmitting = false,
  cardTitle,
  children,
  className,
}: CrudFormLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          {renderBackLink(<ArrowLeft className="h-4 w-4" />)}
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <form onSubmit={onSubmit} className="relative flex flex-col gap-6">
        <Card data-testid="crud-form-card">
          {cardTitle && (
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
            </CardHeader>
          )}
          <CardContent className={cardTitle ? undefined : 'pt-6'}>
            {children}
          </CardContent>
        </Card>

        <div
          data-testid="crud-form-actions"
          className="flex justify-end gap-3 [&>button]:min-w-[140px]"
        >
          {actions ?? (
            <SaveButton isPending={isSubmitting} label={submitLabel} />
          )}
        </div>
      </form>
    </div>
  )
}
