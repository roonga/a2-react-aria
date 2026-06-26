# AGENTS.md

See [CLAUDE.md](./CLAUDE.md) for all project rules, architecture, and contribution guidelines.

## Available components

The following components are registered in `@a2ra/core` and can be emitted as A2UI JSON nodes.
Each entry lists the `type` string, the key props, and the intended use case.

| Type | Key props | Use case |
|------|-----------|----------|
| `Accordion` | `allowsMultipleExpanded`, `isDisabled` | Collapsible disclosure group (FAQs, settings) |
| `AccordionItem` | `heading` (required), `id`, `defaultExpanded`, `isDisabled` | Single disclosure panel inside Accordion |
| `Alert` | `variant` (info/success/warning/error), `title` | Contextual status message; live-region announcement |
| `Breadcrumb` | `items` (array of `{label, href}`) | Hierarchical navigation trail |
| `Button` | `variant`, `size`, `isDisabled`, `isPending` | Primary interaction; submit, confirm, trigger |
| `Card` | `padding`, `shadow`, `radius`, `border` | Surface container for grouping content |
| `Checkbox` | `label`, `isRequired`, `isDisabled`, `isInvalid` | Single boolean form field |
| `CheckboxGroup` | `label`, `options`, `isRequired`, `isDisabled` | Multiple-selection form field |
| `DatePicker` | `label`, `value`, `isDisabled`, `isRequired` | Calendar date input |
| `DateRangePicker` | `label`, `value` (`{start, end}`), `isDisabled` | Date range selection |
| `Dialog` | `title`, `isOpen`, `isDismissable` | Modal overlay with accessible focus trap |
| `Flex` | `direction`, `gap`, `align`, `justify`, `wrap` | Flexbox layout container |
| `Form` | `action`, `method`, `onSubmit` | Form wrapper with validation wiring |
| `Grid` | `columns`, `gap` | CSS grid layout container |
| `Menu` | `label`, `items` (array with `id`, `label`, `onAction`) | Dropdown action menu |
| `NumberField` | `label`, `value`, `min`, `max`, `step`, `isDisabled` | Numeric input with stepper |
| `Popover` | `trigger`, `placement`, `children` | Non-modal floating overlay |
| `Radio` | `value`, `children` | Single radio option inside RadioGroup |
| `RadioGroup` | `label`, `options`, `isRequired`, `isDisabled` | Single-selection form field |
| `Select` | `label`, `options`, `isDisabled`, `isRequired` | Dropdown select input |
| `Switch` | `label`, `isSelected`, `isDisabled` | On/off toggle |
| `Table` | `columns`, `rows`, `selectionMode` | Sortable, selectable data table |
| `Tabs` | `items` (array with `id`, `label`, `content`) | Tabbed navigation panels |
| `Tag` | `id`, `isDisabled`, `children` | Single tag/chip inside TagGroup |
| `TagGroup` | `label`, `selectionMode`, `description` | Tag list with optional selection |
| `Text` | `variant` (heading/body/caption), `size` | Typographic text primitive |
| `TextField` | `label`, `type`, `isRequired`, `isDisabled`, `isInvalid` | Single-line text input |
| `Tooltip` | `trigger`, `placement`, `children` | Hover/focus tooltip |

## Composing nodes

Components nest via the `children` field. Example: a form with a text field and a submit button:

```json
{
  "type": "Form",
  "children": [
    {
      "type": "TextField",
      "props": { "label": "Email", "type": "email", "isRequired": true }
    },
    {
      "type": "Button",
      "props": { "variant": "primary", "type": "submit" },
      "children": "Subscribe"
    }
  ]
}
```

## Design token reference

All components use CSS custom properties. Consumers must define these tokens in their stylesheet
(or use the provided defaults). Key tokens:

| Token | Purpose |
|-------|---------|
| `--color-primary` | Primary action colour |
| `--color-danger` | Destructive / error colour |
| `--color-info` / `--color-info-subtle` / `--color-info-fg` | Info alert palette |
| `--color-success` / `--color-success-subtle` / `--color-success-fg` | Success alert palette |
| `--color-warning` / `--color-warning-subtle` / `--color-warning-fg` | Warning alert palette |
| `--color-danger-subtle` / `--color-danger-fg` | Error alert palette |
| `--color-text` | Default text colour |
| `--color-text-muted` | Secondary / helper text |
| `--color-border` | Default border colour |
| `--color-border-strong` | Emphasized border (e.g. tag hover) |
| `--color-surface` | Card / panel background |
| `--color-surface-hover` | Surface hover state |
| `--color-focus-ring` | Keyboard focus outline colour |
