"use client"

import type { ComponentProps, ReactElement, ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "@workspace/ui/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@workspace/ui/components/drawer"

export {
  DrawerTrigger as SheetTrigger,
  DrawerClose as SheetClose,
  DrawerTitle as SheetTitle,
  DrawerDescription as SheetDescription,
}

export function Sheet(
  props: Omit<ComponentProps<typeof Drawer>, "swipeDirection">
) {
  return <Drawer {...props} swipeDirection="right" />
}

export function SheetContent(
  props: Omit<ComponentProps<typeof DrawerContent>, "side" | "header">
) {
  return <DrawerContent {...props} side="right" />
}

type SheetItemProps = (
  | (ComponentProps<"a"> & { href: string })
  | (ComponentProps<"button"> & { href?: never })
) & {
  active?: boolean
  icon?: ReactNode
  render?: ReactElement
}

export function SheetItem({
  active,
  icon,
  render,
  className,
  children,
  ref,
  ...props
}: SheetItemProps) {
  const isLink = props.href !== undefined
  const current =
    props["aria-current"] ?? (active && isLink ? "page" : undefined)
  const highlighted =
    active ??
    (current !== undefined && current !== false && current !== "false")

  return useRender<
    Record<string, never>,
    HTMLAnchorElement | HTMLButtonElement
  >({
    defaultTagName: isLink ? "a" : "button",
    render,
    ref,
    props: {
      ...(isLink ? {} : { type: "button" }),
      ...props,
      "aria-current": current,
      className: cn(
        "flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 text-left text-base font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none",
        highlighted
          ? "bg-sheet-item-active text-sheet-item-active-foreground"
          : "bg-sheet-item text-sheet-item-foreground hover:bg-sheet-item-active hover:text-sheet-item-active-foreground",
        className
      ),
      children: (
        <>
          {icon && (
            <span aria-hidden className="shrink-0 [&_svg]:size-5">
              {icon}
            </span>
          )}
          <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
        </>
      ),
    },
  })
}

export function SheetNav({ className, ...props }: ComponentProps<"nav">) {
  return <nav {...props} className={cn("flex flex-col gap-3", className)} />
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("mt-auto grid gap-3", className)} />
}
