"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import { AlertDialog as Primitive } from "@base-ui/react/alert-dialog"
import { cn } from "@workspace/ui/lib/utils"

export function Dialog<Payload>(props: Primitive.Root.Props<Payload>) {
  const history = useOverlayHistoryProps(props)
  return <Primitive.Root<Payload> {...props} {...history} />
}
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close
export const DialogTitle = Primitive.Title
export const DialogDescription = Primitive.Description

export function DialogContent({
  className,
  forceBackdrop,
  ...props
}: Omit<Primitive.Popup.Props, "className"> & {
  className?: string
  forceBackdrop?: boolean
}) {
  return (
    <Primitive.Portal>
      <Primitive.Backdrop
        className="ui-overlay-backdrop ui-confirm-backdrop"
        forceRender={forceBackdrop}
      />
      <Primitive.Viewport className="ui-centered-viewport">
        <Primitive.Popup
          {...props}
          className={cn("ui-centered-panel ui-confirm-panel", className)}
        />
      </Primitive.Viewport>
    </Primitive.Portal>
  )
}
