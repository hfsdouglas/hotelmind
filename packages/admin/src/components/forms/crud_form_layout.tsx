import {
  CrudFormLayout as BaseCrudFormLayout,
  type CrudFormLayoutProps as BaseCrudFormLayoutProps,
  SaveButton,
} from '@hotelmind/ui'
import { Link } from 'react-router-dom'

export { SaveButton }

export interface CrudFormLayoutProps
  extends Omit<BaseCrudFormLayoutProps, 'renderBackLink'> {
  backTo: string
}

/** Binds the design system layout to this app's router. */
export function CrudFormLayout({ backTo, ...props }: CrudFormLayoutProps) {
  return (
    <BaseCrudFormLayout
      {...props}
      renderBackLink={icon => <Link to={backTo}>{icon}</Link>}
    />
  )
}
