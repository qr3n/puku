"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import { Menu as Primitive } from "@base-ui/react/menu"
import { cn } from "@workspace/ui/lib/utils"
import { CheckboxMark } from "@workspace/ui/components/checkbox"

export function Menu<Payload>({
  modal = false,
  ...props
}: Primitive.Root.Props<Payload>) {
  const history = useOverlayHistoryProps(props)
  return <Primitive.Root<Payload> {...props} {...history} modal={modal} />
}

export const MenuTrigger = Primitive.Trigger

type MenuContentProps = Omit<Primitive.Popup.Props, "className"> &
  Pick<
    Primitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionAvoidance"
  > & { className?: string }

export function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset,
  collisionAvoidance = {
    side: "flip",
    align: "shift",
    fallbackAxisSide: "end",
  },
  className,
  ...props
}: MenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        className="ui-floating-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={8}
        collisionAvoidance={collisionAvoidance}
      >
        <Primitive.Popup
          {...props}
          className={cn("ui-floating-panel ui-menu-content", className)}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  )
}

export function MenuItem({
  className,
  ...props
}: Omit<Primitive.Item.Props, "className"> & { className?: string }) {
  return <Primitive.Item {...props} className={cn("ui-menu-item", className)} />
}

export function MenuLinkItem({
  className,
  closeOnClick = true,
  ...props
}: Omit<Primitive.LinkItem.Props, "className"> & { className?: string }) {
  return (
    <Primitive.LinkItem
      {...props}
      closeOnClick={closeOnClick}
      className={cn("ui-menu-item", className)}
    />
  )
}

export function MenuCheckboxItem({
  children,
  className,
  ...props
}: Omit<Primitive.CheckboxItem.Props, "className"> & { className?: string }) {
  return (
    <Primitive.CheckboxItem
      {...props}
      className={cn("ui-menu-item", className)}
    >
      <CheckboxMark />
      {children}
    </Primitive.CheckboxItem>
  )
}

export function MenuSeparator({
  className,
  ...props
}: Omit<Primitive.Separator.Props, "className"> & { className?: string }) {
  return (
    <Primitive.Separator
      {...props}
      className={cn("my-1 h-px bg-border", className)}
    />
  )
}
