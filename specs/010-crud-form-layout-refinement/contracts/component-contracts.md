# Component Contracts

No HTTP/API contracts change in this feature. This documents the revised internal contract for `CrudFormLayout`, consumed by all 10 CRUD pages across `packages/web` and `packages/admin`, superseding `specs/009-crud-form-standardization/contracts/component-contracts.md`'s `CrudFormLayout` section. `CheckboxGrid` and `Textarea` are unchanged and not repeated here.

## `CrudFormLayout` (v2)

```ts
interface CrudFormLayoutProps {
  title: string
  backTo: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  actions: React.ReactNode
  cardTitle?: string
}
```

**Contract**:
- Renders a header row (back-arrow `Button` linking to `backTo`, plus `<h1>{title}</h1>`) inside a container whose max-width scales by breakpoint (`sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]`, `w-full` below `sm`), all wrapped in `mx-auto`.
- Renders exactly one `<form onSubmit={onSubmit}>` below the header, containing:
  1. Exactly one `Card` wrapping `children` (with `CardHeader`/`CardTitle` when `cardTitle` is provided).
  2. A footer row below the `Card` (still inside the `<form>`) rendering `actions`, right-aligned (`flex justify-end`), with a consistent non-stretched minimum width applied to each direct-child button.
- Does **not** accept a `sidebar` prop. A page with more than one contextual section renders all of them as sibling blocks inside `children`, each with its own heading — never as a second `Card`.
- Remains a pure presentational component: no data fetching, no business logic, no knowledge of what `onSubmit` does.

## Consumer expectations

Every page using `CrudFormLayout` MUST:
- Move its `<form onSubmit={...}>` wrapper's submit handler into the `onSubmit` prop (the page no longer renders its own `<form>` tag).
- Move its submit/cancel `Button`(s) out of the field markup and into the `actions` prop.
- For pages with a contextual section previously passed via `sidebar`: render that section as a second sibling block inside `children`, with its own heading, instead of a separate `Card`.
