# shadcn/ui monorepo template

This is a Next.js monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Typography

The web app loads Onest for UI text and headings, with Latin and Cyrillic
subsets. Use `font-heading` for headings and `font-mono` for technical text
in Geist Mono. Components inherit the UI font.

An app can set `--font-ui-sans` on its root to choose its UI font and
`--font-ui-heading` to set a separate font for headings. See
`/ui#typography` for a scoped Manrope example.

## Toast notifications

Wrap the app once with `UIProvider` from `@workspace/ui/components/ui-provider`.
The web app already does this in its root layout. Notifications appear at the
top center by default. Use `toast` from the UI package in any client component.

```tsx
import { toast } from "@workspace/ui/components/toast"

toast.success("Settings saved")
```

Use `toast.promise()` to show a pending notification and update it when an
operation succeeds or fails.
