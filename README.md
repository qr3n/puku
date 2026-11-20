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

## Media

`MediaImage` and `MediaVideo` render native media elements and show a shimmer
while they load. Omit `mask` for a rectangular frame or pass your own SVG path
or SVG file URL. The same mask applies to the media, shimmer, and optional
`fallback` on load error. See the examples at `/ui#media`.

```tsx
import { MediaImage, MediaVideo } from "@workspace/ui/components/media"
import { MediaSkeleton, type MediaMask } from "@workspace/ui/components/media-frame"

const mask = {
  viewBox: [0, 0, 240, 160],
  path: "M0 160V80a120 80 0 0 1 240 0v80Z",
} satisfies MediaMask

export function MediaExample() {
  return (
    <>
      <MediaImage src="/photo.webp" alt="Waves on the coast" width={600} height={400} />
      <MediaVideo src="/clip.mp4" mask={mask} controls aria-label="Coast clip" />
      <MediaSkeleton mask={mask} />
      <MediaSkeleton mask="/my-shape.svg" aspectRatio="3 / 2" />
    </>
  )
}
```

The frame reserves space on the server. It uses `aspectRatio` first, then
the path mask's `viewBox`, then the media's `width` and `height`. Default
ratios are square for images and `16 / 9` for video and standalone frames.
For an SVG file URL, set `aspectRatio` to the SVG's `viewBox` ratio if needed.
An SVG file uses its transparency as the mask. Host it on the same origin or
serve it with CORS headers that allow the app's origin.
An inline path uses a `data:` URL. If the app's CSP restricts `img-src`, allow
`data:` or use a hosted SVG.

Use `className` for the frame and `mediaClassName` for the native element.
Media fills the frame with `object-fit: cover` by default. Pass
`mediaClassName="object-contain"` to keep the entire image or video visible.
`MediaFrame` is also available for masking custom content.

## Connection Diagram

Use `ConnectionDiagram` to draw static lines between existing elements. Mark
each node with a unique `data-connection-node` inside the diagram and pass the
connections as an array. The diagram measures the nodes as the layout changes.
The location selection example at `/ui#location-selection-diagram` shows both
shapes, a highlighted primary route, and a toggle for the dashed backup route.

```tsx
import { ConnectionDiagram } from "@workspace/ui/components/connection-diagram"

<ConnectionDiagram
  className="grid min-h-44 grid-cols-2 items-center justify-items-center"
  connections={[
    {
      from: "client",
      to: { node: "server", side: "left" },
      shape: "stepped",
      radius: 16,
    },
  ]}
>
  <div data-connection-node="client">Client</div>
  <div data-connection-node="server">Server</div>
</ConnectionDiagram>
```

A string endpoint chooses its side automatically. To position a line along an
edge, use `side` with `offset` from 0 to 1, measured left to right or top to
bottom. `shape` accepts `stepped` (the default) or `curve`.
Add `via` with node IDs or points such as `{ x: 0.2, y: 0.5 }` to guide a line
around other elements. Point coordinates are fractions of the diagram's width
and height.
Reuse an endpoint in several connections to create branches. Style individual
lines with `className`, `stroke`, `strokeWidth`, or `strokeDasharray`.

Use `shape: "stepped"` for the decorative ledge on the outer branches of the
catalog example. It turns a single right-angle bend into three rounded turns.
Connect a `left` or `right` anchor to a `top` or `bottom` anchor for this layout.
Facing anchors on the same horizontal or vertical axis connect directly.
By default the lead scales with the horizontal and vertical gaps, and the ledge
sits 56% of the way from the horizontal anchor to the vertical anchor. Corner
radii shrink on short segments to leave a visible straight section between bends.
For a fixed composition, pass `step: { lead: 32, position: 0.46 }`. The lead is
in pixels, capped at half the horizontal gap, and the position is a fraction of
the vertical gap. Supplying both values uses the standard corner rounding.

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
