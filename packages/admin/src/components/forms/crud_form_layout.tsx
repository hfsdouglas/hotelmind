import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  SaveButton,
} from '@hotelmind/ui'
import { ArrowLeft } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export { SaveButton }

export interface CrudFormLayoutProps {
  title: string
  backTo: string
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
  backTo,
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
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
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
