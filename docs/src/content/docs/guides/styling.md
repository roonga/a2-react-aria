---
title: Styling
description: Theme a2ra components with shadcn tokens, Tailwind, or plain CSS. You own the source.
sidebar:
  order: 5
---

a2ra components ship with styles built on CSS custom property tokens that follow the
[shadcn/ui theming convention](https://ui.shadcn.com/docs/theming). Because components live in your
project, not in a published package. You own every file and can style them any way you like.

## Design tokens

Each component's styles are defined in a `*.styles.ts` file alongside its source. All colours
reference CSS custom properties, never hardcoded Tailwind values:

```ts
// button.styles.ts
export const buttonStyles = {
  base: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] " +
        "border-[var(--color-border)] rounded-md px-4 py-2 transition-colors",
  variants: {
    danger: "bg-[var(--color-danger)] text-[var(--color-danger-foreground)]",
  },
};
```

Changing a token in your global CSS updates every component that references it.

## Tailwind + shadcn integration

If your project already uses [shadcn/ui](https://ui.shadcn.com/docs/theming), a2ra tokens map
directly to shadcn's CSS variable names. Set or override them in your global stylesheet:

```css
/* globals.css */
@layer base {
  :root {
    --color-primary: hsl(221 83% 53%);
    --color-primary-foreground: hsl(210 40% 98%);
    --color-danger: hsl(0 72% 51%);
    --color-danger-foreground: hsl(0 0% 100%);
    --color-border: hsl(214 32% 91%);
  }

  .dark {
    --color-primary: hsl(217 91% 60%);
    --color-primary-foreground: hsl(222 47% 11%);
    --color-danger: hsl(0 63% 31%);
    --color-danger-foreground: hsl(0 0% 100%);
    --color-border: hsl(217 33% 17%);
  }
}
```

See the [shadcn theming guide](https://ui.shadcn.com/docs/theming) for the full token list and
palette generator.

## Editing component source directly

Because `npx @a2ra/cli add <component>` copies the source into your project, you can edit any file
without fighting a library's API:

- **Change class composition**: edit `*.styles.ts` to add, remove, or swap Tailwind utilities
- **Change structure**: edit the `.tsx` component to alter markup, add props, or wrap elements
- **Override globally**: target the component's class selectors in your global CSS if a one-off
  tweak is all you need

There is no library version to pin and no specificity battles. It is just your code.
