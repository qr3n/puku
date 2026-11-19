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

## Lottie

Search the collection at `/ui#lottie` and use its typed animation names.

```tsx
import { Button } from "@workspace/ui/components/button"
import { Lottie, LottieSkeleton } from "@workspace/ui/components/lottie"

<Lottie name="party-popper" size={48} loop label="Celebration" />
<LottieSkeleton name="party-popper" size={48} />
<Button lottieStart="sparkles">Continue</Button>
<Button lottieEnd={{ name: "waving-hand", size: 24, loop: true }}>Say hello</Button>
```

`Lottie` plays once by default. Use `autoplay={false}` to hold the first
frame. The shimmer follows a WebP preview rendered from frame zero, then
crossfades into the animation. The preview also serves as the static image
when reduced motion is enabled or loading fails.

The optimized collection lives in `packages/ui/assets/lottie` and the web app
serves it at `/api/lottie`. To use a custom self-contained Lottie JSON file, pass
`asset={{ src: "/custom.json", firstFrame: "/custom.webp" }}` to either
component or pass the same option in a button slot.

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
