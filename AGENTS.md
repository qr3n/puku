<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI

- Import shared buttons from `@workspace/ui/components/button`. See `/ui` for variants, sizes, and states.
- Use the default size for everyday actions, `lg` for prominent calls to action, and `sm` or `xs` for dense layouts. Give icon-only buttons an accessible name.
- Pass `loading` while an action is pending. Keep the action label stable and announce progress through an adjacent status region when the surrounding UI needs it.
- Update the examples in `/ui` when you change the shared button API or behavior.
- Use `InputOTP` for one-time codes and `Stepper` for step progress and `StepperContent` for animated step screens. Use `Drawer` for bottom panels, `Sheet` for side panels, `Modal` for centered content, and `Dialog` for confirmations. Supply an accessible title and description for overlays.
- Build side-panel navigation with `SheetNav` and `SheetItem`. Pass `href` for links and use `aria-current` to mark the current destination. Place bottom actions in `SheetFooter`.
- Group overlay titles and descriptions in `OverlayHeader`. Use `OverlayActions` for bottom actions, with the safe choice as `primary` when discarding edits. Pass a long editor's header and its Cancel/Done controls to `DrawerContent.header` to keep them above the scrolling body.
- Keep the theme and component color roles in `packages/ui/src/styles/globals.css`. Use the shared tokens for component surfaces, interactions, and errors.
